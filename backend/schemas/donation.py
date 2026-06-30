from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DonationBase(BaseModel):
    donor_name:Optional[str]=None
    inventory_id:Optional[int]=None
    quantity:int
    notes:Optional[str]=None

class DonationCreate(DonationBase):
        pass

class DonationResponse(DonationBase):
        id:int 
        org_id:int 
        donated_at:datetime

        class Config:
            from_attributes=True
    
