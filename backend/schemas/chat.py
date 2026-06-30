from pydantic import BaseModel
from datetime import datetime,date
from typing import Optional

class ChatMessageCreate(BaseModel):
    content:str

class ChatMessageResponse(BaseModel):
    id:int
    org_id: int
    role:str
    content:str
    created_at:datetime

    class Config:
        from_attributes = True