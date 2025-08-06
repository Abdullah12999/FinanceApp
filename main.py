from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from pymongo import MongoClient
from starlette.middleware.sessions import SessionMiddleware
import secrets
import yfinance as yf
import pandas as pd
import numpy as np
import io
import base64
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from fastapi import Request, Form
from fastapi.responses import HTMLResponse
from datetime import datetime
from bson.decimal128 import Decimal128


app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=secrets.token_hex(16))  # Random secure key
templates = Jinja2Templates(directory="templates")


# MongoDB connection
MONGO_URL = "mongodb+srv://Abdullah:racecar@cluster0.h49ee.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URL)
db = client["finance_app"]
transactions_collection = db["transactions"]
users_collection = db["users"]

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    user = request.session.get("user")
    return templates.TemplateResponse("index.html", {"request": request, "user": user})


@app.get("/test-db")
def test_db():
    try:
        collection = db["test_collection"]
        collection.insert_one({"status": "ok"})
        return {"message": "MongoDB connected and working!"}
    except Exception as e:
        return {"error": str(e)}


# Show the registration form
@app.get("/register", response_class=HTMLResponse)
def register_form(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})


# Handle the form submission
@app.post("/register", response_class=HTMLResponse)
def register_user(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...)
):
    if users_collection.find_one({"email": email}):
        return templates.TemplateResponse("register.html", {
            "request": request,
            "error": "This email is already registered."
        })

    users_collection.insert_one({
        "name": name,
        "email": email,
        "password": password
    })

    return templates.TemplateResponse("register.html", {
        "request": request,
        "success": True
    })


@app.get("/login", response_class=HTMLResponse)
def show_login_form(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


@app.post("/login", response_class=HTMLResponse)
def login_user(
    request: Request,
    email: str = Form(...),
    password: str = Form(...)
):
    user = users_collection.find_one({"email": email})

    if not user or user["password"] != password:
        return templates.TemplateResponse("login.html", {
            "request": request,
            "error": "Invalid email or password"
        })

    # ✅ Store user in session
    request.session["user"] = user["name"]
    return RedirectResponse("/", status_code=303)


@app.post("/logout")
def logout(request: Request):
    request.session.clear()
    return RedirectResponse("/", status_code=303)


@app.get("/predict-stock", response_class=HTMLResponse)
def show_predictor(request: Request):
    return templates.TemplateResponse("predictor.html", {"request": request})



@app.post("/predict-stock", response_class=HTMLResponse)
def predict_stock(request: Request, ticker: str = Form(...)):
    try:
        df = yf.download(ticker, period="60d", interval="1d", auto_adjust=False)

        if df.empty or len(df) < 2:
            raise ValueError("Not enough data.")

        # Prepare data
        df = df[["Close"]].dropna()
        df["Days"] = np.arange(len(df))
        X = df[["Days"]]
        y = df["Close"]

        # Linear Regression
        model = LinearRegression()
        model.fit(X, y)

        # Predict next 30 days
        future_days = np.arange(len(df), len(df) + 30).reshape(-1, 1)
        predictions = model.predict(future_days)
        predictions = [round(float(p), 2) for p in predictions]

        # Additional Insights
        slope = float(model.coef_[0])
        recent_volatility = float(np.std(df["Close"].values[-10:]))
        recent_return = float((df["Close"].values[-1] - df["Close"].values[-10]) / df["Close"].values[-10] * 100)
        predictions_train = model.predict(X)
        rmse = float(np.sqrt(np.mean((y - predictions_train) ** 2)))

        # Plotting
        plt.figure(figsize=(10, 5))
        plt.plot(df["Days"], df["Close"], label="Historical Close", color="#1f77b4", linewidth=2)
        plt.plot(future_days, predictions, label="Predicted Close", color="#ff7f0e", linestyle="--", marker="o", linewidth=2, markersize=6)
        plt.axvline(x=len(df)-1, color="gray", linestyle=":", linewidth=1)

        plt.title(f"{ticker.upper()} Stock Price Forecast", fontsize=16, fontweight="bold")
        plt.xlabel("Trading Day Index", fontsize=12)
        plt.ylabel("Closing Price (USD)", fontsize=12)
        plt.legend(loc="upper left", fontsize=10)
        plt.grid(True, linestyle="--", alpha=0.5)
        plt.tight_layout()

        # Convert plot to base64 string
        buf = io.BytesIO()
        plt.savefig(buf, format="png")
        buf.seek(0)
        img_data = base64.b64encode(buf.read()).decode("utf-8")
        plt.close()

        # Return to template
        return templates.TemplateResponse("predictor.html", {
            "request": request,
            "ticker": ticker.upper(),
            "prediction_list": predictions,
            "plot_url": img_data,
            "slope": round(slope, 4),
            "volatility": round(recent_volatility, 2),
            "recent_return": round(recent_return, 2),
            "rmse": round(rmse, 2)
        })

    except Exception as e:
        print("DEBUG ERROR:", e)
        return templates.TemplateResponse("predictor.html", {
            "request": request,
            "error": f"Unable to fetch prediction for '{ticker.upper()}'."
        })


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

@app.get("/tracker", response_class=HTMLResponse)
def show_tracker(request: Request, month: str = None):
    user = request.session.get("user")
    if not user:
        return RedirectResponse("/login", status_code=303)

    # Use query param or default to current month
    if not month:
        today = datetime.today()
        month = today.strftime("%Y-%m")
    else:
        try:
            datetime.strptime(month, "%Y-%m")  # validate format
        except ValueError:
            month = datetime.today().strftime("%Y-%m")

    # Fetch entries for the given month
    entries = list(db.entries.find({"user": user, "month": month}))

    # Fetch persistent income history
    income_docs = db.income.find({"user": user})
    monthly_income = get_effective_salary(income_docs, month)

    # Calculate totals
    one_time_income_total = sum(float(e["amount"]) for e in entries if e["type"] == "one-time-income")
    expense_total = sum(float(e["amount"]) for e in entries if e["type"] == "expense")
    total_income = monthly_income + one_time_income_total
    net_savings = total_income - expense_total

    return templates.TemplateResponse("tracker.html", {
        "request": request,
        "entries": entries,
        "month": month,
        "monthly_income": round(monthly_income, 2),
        "one_time_income": round(one_time_income_total, 2),
        "total_expense": round(expense_total, 2),
        "net_savings": round(net_savings, 2),
        "total_income": round(total_income, 2),
        "current_date": datetime.today().strftime("%Y-%m-%d"),
    })




@app.post("/tracker/income", response_class=HTMLResponse)
def set_monthly_income(
    request: Request,
    amount: float = Form(...),
    month: str = Form(...)
):
    user = request.session.get("user")
    if not user:
        return RedirectResponse("/login", status_code=303)

    # Validate month format
    try:
        datetime.strptime(month, "%Y-%m")
    except ValueError:
        month = datetime.today().strftime("%Y-%m")  # fallback if invalid

    # Save/update salary only for future months and beyond
    db.income.update_one(
        {"user": user, "effective_month": month},
        {"$set": {"amount": amount}},
        upsert=True
    )

    return RedirectResponse("/tracker", status_code=303)


@app.post("/tracker/entry", response_class=HTMLResponse)
def add_tracker_entry(
    request: Request,
    amount: float = Form(...),
    type: str = Form(...),  # "expense" or "one-time-income"
    category: str = Form(...),
    description: str = Form(...),
    date: str = Form(None)  # Optional
):
    user = request.session.get("user")
    if not user:
        return RedirectResponse("/login", status_code=303)

    # Default to today if not specified
    entry_date = datetime.strptime(date, "%Y-%m-%d") if date else datetime.today()
    month = entry_date.strftime("%Y-%m")

    # Insert the actual entry
    db.entries.insert_one({
        "user": user,
        "month": month,
        "date": entry_date.strftime("%Y-%m-%d"),
        "type": type,
        "amount": amount,
        "category": category,
        "description": description
    })

    # If this is an expense, update category totals
    if type == "expense" and category:
        db.category_totals.update_one(
            {"user": user, "month": month, "category": category},
            {"$inc": {"total": amount}},
            upsert=True
        )

    return RedirectResponse("/tracker", status_code=303)
