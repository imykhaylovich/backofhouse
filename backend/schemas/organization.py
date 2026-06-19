from pydantic import BaseModel
from typing import Optional
from datetime import datetime
class OrganizationBase(BaseModel):
    name: str
    type: str
    email: str
    city: Optional[str] = None
    state: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase):
    id: int
    plan: str
    created_at: datetime

    class Config:
        from_attributes = True