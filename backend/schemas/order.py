from pydantic import BaseModel
from datetime import datetime
from typing import Optional
class OrderBase(BaseModel):
    type:str
    status: Optional[str]=None
    notes: Optional[str]=None

class OrderCreate(OrderBase):
    pass

class OrderResponse(OrderBase):
    id:int
    org_id:int
    created_at:datetime
    
    class Config:
        from_attributes=True
