from sqlalchemy import Column, Integer,ForeignKey,String, DateTime, Enum,Text
from sqlalchemy.sql import func
from database import Base


class Distribution(Base):
    __tablename__ = 'distributions'
    #PK
    id=Column(Integer,primary_key=True,index=True)
    #FK
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id"), nullable=True)
    quantity=Column(Integer,nullable=False)
    recipient_count=Column(Integer,nullable=True)
    distributed_at=Column(DateTime(timezone=True),default=func.now())
    notes=Column(Text,nullable=True)