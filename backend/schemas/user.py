from pydantic import BaseModel
from datetime import datetime
class UserBase(BaseModel):
    name: str
    email: str
    password:str
    org_id:int

class UserCreate(UserBase):
    pass

class UserResponse(BaseModel):
    id: int
    org_id: int
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str