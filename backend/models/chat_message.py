from sqlalchemy import Column, Integer,ForeignKey,String, DateTime, Enum,Text
from sqlalchemy.sql import func
from database import Base


class ChatMessage(Base):
    __tablename__ = 'chat_messages'
    #PK
    id=Column(Integer,primary_key=True,index=True)

    #FK
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    #Columns
    role=Column(Enum("user","assistant"),nullable=False)
    content=Column(Text,nullable=False)
    created_at=Column(DateTime(timezone=True),default=func.now())