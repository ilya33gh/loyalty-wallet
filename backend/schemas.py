from pydantic import BaseModel, field_validator
from datetime import datetime
from enum import Enum
from typing import Optional
import re

class CardCategory(str, Enum):
    other = "other"
    groceries = "groceries"
    cafe = "cafe"
    clothes = "clothes"
    pharmacy = "pharmacy"
    electronics = "electronics"


class CardColor(str, Enum):
    gray = "gray"
    blue = "blue"
    green = "green"
    red = "red"
    orange = "orange"
    purple = "purple"
    teal = "teal"
    brown = "brown"


class CodeType(str, Enum):
    qr = "qr"
    ean13 = "ean13"
    ean8 = "ean8"
    code128 = "code128"
    upc = "upc"


class CardCreate(BaseModel):
    title: str
    color: CardColor
    category: CardCategory
    code_type: CodeType
    code_value: str
    is_favorite: bool = False

    @field_validator("code_value")
    @classmethod
    def validate_code_value(cls, v, info):
        code_type = info.data.get("code_type")

        if code_type == CodeType.ean13 and len(v) != 13:
            raise ValueError("EAN13 must be 13 digits")

        if code_type == CodeType.ean8 and len(v) != 8:
            raise ValueError("EAN8 must be 8 digits")

        return v


class CardUpdate(BaseModel):
    title: Optional[str] = None
    color: Optional[CardColor] = None
    category: Optional[CardCategory] = None
    code_type: Optional[CodeType] = None
    code_value: Optional[str] = None
    is_favorite: Optional[bool] = None


class CardResponse(BaseModel):
    id: int
    title: str
    color: CardColor
    category: CardCategory
    code_type: CodeType
    code_value: str
    is_favorite: bool
    created_at: datetime

    class Config:
        from_attributes = True

