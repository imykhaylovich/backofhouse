from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user


router = APIRouter()

@router.get("/",response_model=list[schemas.OrderResponse])
def get_all_orders(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    orders = db.query(models.Order).filter(
        models.Order.org_id == current_user.org_id
    ).all()
    return orders


@router.post("/",response_model=schemas.OrderResponse)
def add_Order(order: schemas.OrderCreate,db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    new_order= models.Order(
        org_id=current_user.org_id,
        type=order.type,
        status=order.status,
        notes=order.notes,

    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@router.put("/{order_id}", response_model=schemas.OrderResponse)
def update_order(order_id: int,order: schemas.OrderCreate, db: Session= Depends(get_db), current_user = Depends(get_current_user)):
    existing = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.org_id==current_user.org_id
        ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Note not found")
    
    existing.type=order.type
    existing.status=order.status
    existing.notes=order.notes
    db.commit()
    db.refresh(existing)
    return existing

@router.delete("/{order_id}")
def delete_item(order_id: int,db: Session= Depends(get_db), current_user = Depends(get_current_user)):
    existing = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.org_id==current_user.org_id
        ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(existing)
    db.commit()
    return {"message": "Item deleted successfully"}

