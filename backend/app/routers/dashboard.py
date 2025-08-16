from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from ..services import dashboard as dashboard_service
from ..services.auth import get_current_user
from ..schemas.dashboard import TrackerEntry, MonthlyIncome

router = APIRouter(tags=["Dashboard"])

@router.get("/tracker")
async def get_tracker(month: str = None, user: str = Depends(get_current_user)):
    return await dashboard_service.get_tracker_data(user, month)

@router.post("/tracker/income")
async def set_income(data: MonthlyIncome, user: str = Depends(get_current_user)):
    await dashboard_service.set_monthly_income(user, data.amount, data.month)
    return JSONResponse(content={"message": "Monthly income set successfully."})

@router.post("/tracker/entry")
async def add_entry(data: TrackerEntry, user: str = Depends(get_current_user)):
    await dashboard_service.add_tracker_entry(user, data.amount, data.type, data.category, data.description, data.date)
    return JSONResponse(content={"message": "Entry added successfully."})

@router.get("/category-totals")  # Correct!
async def get_category_totals(month: str = None, user: str = Depends(get_current_user)):
    return await dashboard_service.get_category_totals(user, month)



