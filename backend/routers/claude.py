from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
import schemas
from services.claude_service import chat_with_claude
router = APIRouter()
@router.post("/chat",response_model=schemas.ChatMessageResponse)
def chat(
    question: schemas.ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user= Depends(get_current_user),
):
    organization=db.query(models.Organization).filter(
        models.Organization.id==current_user.org_id).first()
    if not  organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    user_entry= models.ChatMessage(
        org_id=organization.id,
        role='user',
        content=question.content
    )
    db.add(user_entry)
    db.commit()
    answer=chat_with_claude(db,organization,question.content)
    ai_entry=models.ChatMessage(
        org_id=organization.id,
        role='assistant',
        content=answer,
    )
    db.add(ai_entry)
    db.commit()
    db.refresh(ai_entry)
    return ai_entry