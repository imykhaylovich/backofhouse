from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
import schemas
from fastapi import APIRouter, Depends, HTTPException
from services.claude_service import generate_weekly_report

router = APIRouter()
@router.get("/",response_model=list[schemas.ReportResponse])
def get_all_reports(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    reports = db.query(models.WeeklyReport).filter(
        models.WeeklyReport.org_id == current_user.org_id
    ).order_by(models.WeeklyReport.week_start.desc()).all()
    return reports
@router.post("/generate", response_model=schemas.ReportResponse)
def generate_report(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    organization = db.query(models.Organization).filter(
        models.Organization.id == current_user.org_id
    ).first()
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")

    report = generate_weekly_report(db, organization)
    return report