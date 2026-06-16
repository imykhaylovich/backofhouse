from sqlalchemy import Column, Integer,ForeignKey,String, DateTime, Enum
from sqlalchemy.sql import func
from database import Base


class User(Base):
    _tablename_='user'
    #PK
    id=Column(Integer,primary_key=True,index=True)

    #FK
    org_id=Column(Integer,ForeignKey("organization.id",ondelete="CASCADE"),
        nullable=False,index=True)
    #Colums
    name= Column(String(100),nullable=False)
    email= Column(String(100),nullable=False,unique=True)
    password_hash = Column(String(255), nullable=False)
    role=Column(Enum("admin","staff"),default='staff')
    created_at=Column(DateTime(timezone=True),default=func.now())

