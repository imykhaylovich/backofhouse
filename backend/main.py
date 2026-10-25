from fastapi import FastAPI
from database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
import models
from routers import auth, inventory, orders, donations, distributions, claude, reports

app = FastAPI()
Base.metadata.create_all(bind=engine)

origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])
app.include_router(donations.router, prefix="/donations", tags=["donations"])
app.include_router(distributions.router, prefix="/distributions", tags=["distributions"])

@app.get("/")
def root():
    return {"message": "BackOfHouse API is running"}

app.include_router(claude.router, prefix="/claude", tags=["claude"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])
origins = ["http://localhost:5173", "https://backofhouse3.netlify.app"]