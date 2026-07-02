from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user


router = APIRouter()

@router.get("/",response_model=list[schemas.DonationResponse])
def get_all_orders(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    donations = db.query(models.Donation).filter(
        models.Donation.org_id == current_user.org_id
    ).all()
    return donations

@router.post("/",response_model=schemas.DonationResponse)
def add_donation(donation: schemas.DonationCreate,db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    new_donation= models.Donation(
        org_id=current_user.org_id,
        donor_name=donation.donor_name,
        inventory_id=donation.inventory_id,
        quantity=donation.quantity,
        notes=donation.notes,
    )
    db.add(new_donation)
    db.commit()
    db.refresh(new_donation)
    if new_donation.inventory_id:
        inventory_item = db.query(models.Inventory).filter(
            models.Inventory.id == new_donation.inventory_id,
            models.Inventory.org_id == current_user.org_id
        ).first()
        if inventory_item:
            inventory_item.quantity += new_donation.quantity
            db.commit()
    return new_donation

@router.delete("/{donation_id}")
def delete_item(donation_id: int,db: Session= Depends(get_db), current_user = Depends(get_current_user)):
    existing = db.query(models.Donation).filter(
        models.Donation.id == donation_id,
        models.Donation.org_id==current_user.org_id
        ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(existing)
    db.commit()
    return {"message": "Item deleted successfully"}