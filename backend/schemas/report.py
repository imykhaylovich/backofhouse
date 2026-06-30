from pydantic import BaseModel
from datetime import datetime,date
from typing import Optional

class ReportResponse(BaseModel):
    id: int
    org_id: int
    week_start:date
    week_end:date
    report_text:Optional[str]=None
    emailed_at:Optional[datetime]=None
    created_at: datetime
    class Config:
        from_attributes = True