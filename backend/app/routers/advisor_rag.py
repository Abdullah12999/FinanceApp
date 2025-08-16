from fastapi import APIRouter, Depends, HTTPException

from ..services import dashboard as dashboard_service
from ..services.auth import get_current_user
from ...rag_modules.pipeline import generate_financial_advice


router = APIRouter(tags=["Advisor"])


@router.get("/financial-advice")
async def get_financial_advice(user_email: str = Depends(get_current_user)):
    """
    Fetches all user expenses from the database, concatenates them,
    and returns personalized financial advice.
    """
    try:
        user_expenses = await dashboard_service.get_user_expenses(user_email)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching expenses: {e}")

    if not user_expenses:
        return {"advice": "No expense data found. Please add some expenses to get advice."}

    expenses_summary_list = []
    for expense in user_expenses:
        expenses_summary_list.append(
            f"Price: {expense.get('amount')}. Category: {expense.get('category')}. Description: {expense.get('description')}."
        )

    user_expenses_summary = " ".join(expenses_summary_list)

    advice = generate_financial_advice(user_expenses_summary)

    return {"advice": advice}

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict

# Import the new service function
from ..services import dashboard as dashboard_service
# Import your authentication dependency
from ..services.auth import get_current_user
# Import your RAG pipeline function (only what you actually use)
from ...rag_modules.pipeline import generate_financial_advice, llm, db

router = APIRouter()

@router.get("/financial-advice")
async def get_financial_advice(user_email: str = Depends(get_current_user)):
    """
    Fetches all user expenses from the database, concatenates them,
    and returns personalized financial advice.
    """
    # 1. Fetch all expense entries for the logged-in user.
    try:
        user_expenses = await dashboard_service.get_user_expenses(user_email)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching expenses: {e}")

    if not user_expenses:
        return {"advice": "No expense data found. Please add some expenses to get advice."}

    # 2. Concatenate the expenses into a single, comprehensive string.
    expenses_summary_list = []
    for expense in user_expenses:
        expenses_summary_list.append(
            f"Price: {expense.get('amount')}. Category: {expense.get('category')}. Description: {expense.get('description')}."
        )
    
    # Join all the individual expense strings into one large string.
    user_expenses_summary = " ".join(expenses_summary_list)
    
    # 3. Pass the concatenated string to the RAG pipeline.
    advice = generate_financial_advice(user_expenses_summary, llm, db)
    
    # 4. Return only the advice.
    return {
        "advice": advice
    }
