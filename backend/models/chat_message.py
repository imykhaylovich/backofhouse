from sqlalchemy import Column, Integer,ForeignKey,String, DateTime, Enum,Text
from sqlalchemy.sql import func
from database import Base


class ChatMessage(Base):
    _tablename_='chat_message'
    #PK
    id=Column(Integer,primary_key=True,index=True)

    #FK
    org_id=Column(Integer,ForeignKey("organization.id",ondelete="CASCADE"),
        nullable=False,index=True)
    #Columns
    role=Column(Enum("user","assistant",nullable=False)
    content=Column(Text,nullable=False)
    created_at=Column(DateTime(timezone=True),default=func.now())