from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey,Date
from sqlalchemy.sql import func
from database import Base

class Inventory(Base):
    __tablename__ = 'inventory'

    #PK
    id=Column(Integer,primary_key=True,index=True)

    #FK
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    
    #Colums
    name= Column(String(100),nullable=False)
    category=Column(String(50),nullable=True)
    quantity=Column(Integer,default=0)
    unit=Column(String(20),nullable=True)
    low_threshold=Column(Integer,default=10)
    expiration_date=Column(Date,nullable=True)
    updated_at=Column(DateTime(timezone=True),default=func.now(),onupdate=func.now())

