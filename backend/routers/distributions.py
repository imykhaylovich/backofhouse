from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user


router = APIRouter()

@router.get("/",response_model=list[schemas.DistributionResponse])
def get_all_orders(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    distribution = db.query(models.Distribution).filter(
        models.Distribution.org_id == current_user.org_id
    ).all()
    return distribution

@router.post("/",response_model=schemas.DistributionResponse)
def add_distribution(distribution: schemas.DistributionCreate,db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    new_distribution= models.Distribution(
        org_id=current_user.org_id,
        inventory_id=distribution.inventory_id,
        quantity=distribution.quantity,
        recipient_count=distribution.recipient_count,
        notes=distribution.notes,
    )
    if distribution.inventory_id:
        inventory_item = db.query(models.Inventory).filter(
        models.Inventory.id == distribution.inventory_id,
        models.Inventory.org_id == current_user.org_id
        ).first()
        if inventory_item:
            if inventory_item.quantity - distribution.quantity < 0:
                raise HTTPException(status_code=400, detail="Not enough stock")
            inventory_item.quantity -= distribution.quantity
            db.commit()
    db.add(new_distribution)
    db.commit()
    db.refresh(new_distribution)
    return new_distribution

@router.delete("/{distribution_id}")
def delete_item(distribution_id: int,db: Session= Depends(get_db), current_user = Depends(get_current_user)):
    existing = db.query(models.Distribution).filter(
        models.Distribution.id == distribution_id,
        models.Distribution.org_id==current_user.org_id
        ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(existing)
    db.commit()
    return {"message": "Item deleted successfully"}