from sqlalchemy import Column, Integer,ForeignKey,String, DateTime, Enum,Text
from sqlalchemy.sql import func
from database import Base


class Donation(Base):
    _tablename_='donation'
    #PK
    id=Column(Integer,primary_key=True,index=True)
    #FK
    org_id=Column(Integer,ForeignKey("organization.id",ondelete="CASCADE"),
        nullable=False,index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id"), nullable=True)
    #Columns
    donor_name=Column(String(100),nullable=True)
    quantity=Column(Integer,nullable=False)
    donated_at=Column(DateTime(timezone=True),default=func.now())
    notes=Column(Text,nullable=True)
