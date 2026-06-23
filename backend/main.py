from fastapi import FastAPI
from database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
import models

app = FastAPI()
Base.metadata.create_all(bind=engine)

origins = ["http://localhost:5173"]
from routers import auth

app.include_router(auth.router, prefix="/auth", tags=["auth"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "BackOfHouse API is running"}