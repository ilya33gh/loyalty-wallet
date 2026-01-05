from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime

from backend.database import Base


class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)
    color = Column(String, nullable=False)
    category = Column(String, nullable=False, default="other")

    code_type = Column(String, nullable=False)
    code_value = Column(String, nullable=False)

    is_favorite = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
