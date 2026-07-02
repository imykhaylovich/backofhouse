from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter()

@router.get("/",response_model=list[schemas.InventoryResponse])
def get_all_inventory(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    inventory = db.query(models.Inventory).filter(
        models.Inventory.org_id == current_user.org_id
    ).all()
    return inventory


@router.get("/low-stock",response_model=list[schemas.InventoryResponse])
def get_low_inventory(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    inventory = db.query(models.Inventory).filter(
        models.Inventory.org_id == current_user.org_id,
        models.Inventory.quantity<= models.Inventory.low_threshold
    ).all()
    return inventory


@router.post("/",response_model=schemas.InventoryResponse)
def add_Inv(item: schemas.InventoryCreate,db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    new_inv= models.Inventory(
        org_id=current_user.org_id,
        name=item.name,
        category=item.category,
        quantity=item.quantity,
        unit=item.unit,
        low_threshold=item.low_threshold,
        expiration_date=item.expiration_date

    )
    db.add(new_inv)
    db.commit()
    db.refresh(new_inv)
    return new_inv

@router.put("/{item_id}", response_model=schemas.InventoryResponse)
def update_inv(item_id: int,item: schemas.InventoryCreate, db: Session= Depends(get_db), current_user = Depends(get_current_user)):
    existing = db.query(models.Inventory).filter(
        models.Inventory.id == item_id,
        models.Inventory.org_id==current_user.org_id
        ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Note not found")
    
    existing.name=item.name
    existing.category=item.category
    existing.quantity=item.quantity
    existing.unit=item.unit
    existing.low_threshold=item.low_threshold
    existing.expiration_date=item.expiration_date
    db.commit()
    db.refresh(existing)
    return existing

@router.delete("/{item_id}")
def delete_item(item_id: int,db: Session= Depends(get_db), current_user = Depends(get_current_user)):
    existing = db.query(models.Inventory).filter(
        models.Inventory.id == item_id,
        models.Inventory.org_id==current_user.org_id
        ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(existing)
    db.commit()
    return {"message": "Item deleted successfully"}

