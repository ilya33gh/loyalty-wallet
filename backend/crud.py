from sqlalchemy.orm import Session

from models import Card
from schemas import CardCreate, CardUpdate


def create_card(db: Session, card: CardCreate):
    db_card = Card(
        title=card.title,
        color=card.color,
        category=card.category,
        code_type=card.code_type.value,
        code_value=card.code_value,
        is_favorite=card.is_favorite,
    )


    db.add(db_card)
    db.commit()
    db.refresh(db_card)

    return db_card


def get_cards(db: Session):
    cards = db.query(Card).order_by(Card.created_at.desc()).all()

    for card in cards:
        card.code_type = card.code_type.lower()

    return cards



def update_card(db: Session, card_id: int, card: CardUpdate):
    db_card = db.query(Card).filter(Card.id == card_id).first()

    if not db_card:
        return None

    if card.title is not None:
        db_card.title = card.title

    if card.color is not None:
        db_card.color = card.color

    if card.category is not None:
        db_card.category = card.category

    if card.code_type is not None:
        db_card.code_type = card.code_type.value

    if card.code_value is not None:
        db_card.code_value = card.code_value

    if card.is_favorite is not None:
        db_card.is_favorite = card.is_favorite


    db.commit()
    db.refresh(db_card)

    return db_card

def delete_card(db: Session, card_id: int) -> bool:
    db_card = db.query(Card).filter(Card.id == card_id).first()

    if not db_card:
        return False

    db.delete(db_card)
    db.commit()

    return True
