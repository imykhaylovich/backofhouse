from sqlalchemy import Column, Integer,ForeignKey,String, DateTime, Enum,Text
from sqlalchemy.sql import func
from database import Base


class Order(Base):
    __tablename__ = 'orders'
    #PK
    id=Column(Integer,primary_key=True,index=True)
    #FK
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    #Colums
    type=Column(Enum("incoming","outgoing"),nullable=False)
    status=Column(Enum("pending","confirmed","fulfiled","cancelled"),default="pending")
    notes=Column(Text,nullable=True)
    created_at=Column(DateTime(timezone=True),default=func.now())