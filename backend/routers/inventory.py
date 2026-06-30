from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter()

@router.get("/")
def get_inventory(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    items = db.query(models.Inventory).filter(
        models.Inventory.org_id == current_user.org_id
    ).all()
    return items
@router.post("/")