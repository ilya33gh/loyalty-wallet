from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.schemas import CardCreate, CardUpdate, CardResponse
from backend.crud import create_card, get_cards, update_card, delete_card

router = APIRouter(prefix="/cards", tags=["Cards"])


@router.post("/", response_model=CardResponse)
def add_card(card: CardCreate, db: Session = Depends(get_db)):
    return create_card(db, card)


@router.get("/", response_model=List[CardResponse])
def list_cards(db: Session = Depends(get_db)):
    return get_cards(db)

@router.put("/{card_id}", response_model=CardResponse)
def edit_card(
    card_id: int,
    card: CardUpdate,
    db: Session = Depends(get_db)
):
    updated_card = update_card(db, card_id, card)

    if not updated_card:
        raise HTTPException(status_code=404, detail="Card not found")

    return updated_card

@router.delete("/{card_id}", status_code=204)
def remove_card(card_id: int, db: Session = Depends(get_db)):
    success = delete_card(db, card_id)

    if not success:
        raise HTTPException(status_code=404, detail="Card not found")
