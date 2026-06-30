from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DistributionBase(BaseModel):
    inventory_id: Optional[int] = None
    quantity: int
    recipient_count: Optional[int] = None
    notes: Optional[str] = None

class DistributionCreate(DistributionBase):
    pass

class DistributionResponse(DistributionBase):
    id: int
    org_id: int
    distributed_at: datetime

    class Config:
        from_attributes = True