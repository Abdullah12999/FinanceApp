from datetime import datetime
from bson import ObjectId
from ..database import get_database

db = get_database()

def get_effective_salary(income_docs, target_month_str):
    target_month = datetime.strptime(target_month_str, "%Y-%m")
    applicable_docs = []

    for doc in income_docs:
        try:
            doc_month = datetime.strptime(doc["effective_month"], "%Y-%m")
            if doc_month <= target_month:
                applicable_docs.append((doc_month, float(doc["amount"])))
        except:
            continue

    if not applicable_docs:
        return 0.0

    applicable_docs.sort(reverse=True)
    return applicable_docs[0][1]

# 🔁 Utility function to convert Mongo ObjectId to string
def serialize_doc(doc):
    doc["_id"] = str(doc["_id"])
    return doc

async def get_tracker_data(user_email: str, month: str = None):
    if not month:
        month = datetime.today().strftime("%Y-%m")

    # Get entries and income data
    entries = await db.entries.find({"user": user_email, "month": month}).to_list(length=100)
    income_docs = await db.income.find({"user": user_email}).to_list(length=100)

    # Serialize ObjectId
    entries = [serialize_doc(e) for e in entries]
    income_docs = [serialize_doc(i) for i in income_docs]

    # Calculate metrics
    monthly_income = get_effective_salary(income_docs, month)
    side_income_total = sum(float(e["amount"]) for e in entries if e["type"] == "side-income")
    expense_total = sum(float(e["amount"]) for e in entries if e["type"] == "expense")
    total_income = monthly_income + side_income_total
    net_savings = total_income - expense_total
    return {
    "entries": entries,
    "month": month,
    "monthly_income": round(monthly_income, 2),
    "side_income": round(side_income_total, 2),
    "total_expense": round(expense_total, 2),
    "net_savings": round(net_savings, 2),
    "total_income": round(total_income, 2),
}

async def set_monthly_income(user_email: str, amount: float, month: str):
    await db.income.update_one(
        {"user": user_email, "effective_month": month},
        {"$set": {"amount": amount}},
        upsert=True
    )

async def add_tracker_entry(user_email: str, amount: float, type_: str, category: str, description: str, date: str = None):
    entry_date = datetime.strptime(date, "%Y-%m-%d") if date else datetime.today()
    month = entry_date.strftime("%Y-%m")

    await db.entries.insert_one({
        "user": user_email,
        "month": month,
        "date": entry_date.strftime("%Y-%m-%d"),
        "type": type_,
        "amount": amount,
        "category": category,
        "description": description
    })

    # ✅ Only track category totals for "expense" type
    if type_ == "expense":
        await db.category_totals.update_one(
            {"user": user_email, "month": month, "category": category},
            {"$inc": {"total": amount}},
            upsert=True
        )


async def get_category_totals(user_email: str, month: str = None):
    if not month:
        month = datetime.today().strftime("%Y-%m")

    totals = await db.category_totals.find({
        "user": user_email,
        "month": month
    }).to_list(length=100)

    # Convert ObjectId to str
    return [serialize_doc(t) for t in totals]


async def get_user_expenses(user_email: str):
    """Return all expense entries for a user across months.
    Matches advisor RAG router expectation.
    """
    entries = await db.entries.find({
        "user": user_email,
        "type": "expense",
    }).to_list(length=1000)
    return [serialize_doc(e) for e in entries]