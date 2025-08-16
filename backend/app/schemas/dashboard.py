from pydantic import BaseModel
from typing import Optional, Literal

class TrackerEntry(BaseModel):
    amount: float
    type: Literal["expense", "side-income"] 
    category: str
    description: str
    date: Optional[str]

class MonthlyIncome(BaseModel):
    amount: float
    month: str