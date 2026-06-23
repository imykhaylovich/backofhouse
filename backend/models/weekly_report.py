from sqlalchemy import Column, Integer,ForeignKey,String, DateTime, Enum,Text,Date
from sqlalchemy.sql import func
from database import Base


class WeeklyReport(Base):
    __tablename__ = 'weekly_reports'
    #PK
    id=Column(Integer,primary_key=True,index=True)
    #FK
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    #Columns
    week_start=Column(Date,nullable=False)
    week_end=Column(Date,nullable=False)
    report_text=Column(Text,nullable=True)
    emailed_at=Column(DateTime(timezone=True),nullable=True)
    created_at=Column(DateTime(timezone=True),default=func.now())