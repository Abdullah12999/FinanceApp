from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routers import auth, dashboard, advisor_rag
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/user")
app.include_router(dashboard.router, prefix="/api/dashboard")
app.include_router(advisor_rag.router, prefix="/api/advisor")


@app.get("/")
def read_root():
    return {"message": "Welcome to the FinanceApp API"}
