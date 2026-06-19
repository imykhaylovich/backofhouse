from fastapi import FastAPI
from database import engine, Base
from fastapi.middleware.cors import CORSMiddleware



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
@app.get("/")
def root():
    return {"message": "BackOfHouse API is running"}
