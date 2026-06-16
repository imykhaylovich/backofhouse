from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from database import Base


class Organization(Base):
    _tablename_='organization'

    #PK
    id=Column(Integer,primary_key=True,index=True)

     #Colums
    name= Column(String(100),nullable=False)
    type = Column(Enum("nonprofit", "cafe", "restaurant", "bakery", "bar", "other"), nullable=False)
    plan=Column(Enum("free","paid"),default="free")
    email= Column(String(100),nullable=False,unique=True)
    city= Column(String(100),nullable=True)
    state= Column(String(50),nullable=True)
    created_at=Column(DateTime(timezone=True),default=func.now())

    #relationship
    #user


