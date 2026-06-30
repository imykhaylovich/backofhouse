from pydantic import BaseModel
from datetime import datetime,date
from typing import Optional
class InventoryBase(BaseModel):
    name: str
    category: str
    quantity:int
    unit:str
    low_threshold:int
    expiration_date:Optional[date]=None
    

class InventoryCreate(InventoryBase):
    pass

class InventoryResponse(InventoryBase):
    id: int
    org_id: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

