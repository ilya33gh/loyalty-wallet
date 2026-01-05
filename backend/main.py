from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import engine
from backend.models import Base
from backend.routes.cards import router as cards_router
from backend.routes.telegram import router as telegram_router

app = FastAPI(title="Loyalty Wallet API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",        # dev
        "https://cards.ilynoise.ru",    # prod
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(cards_router)
app.include_router(telegram_router)


@app.get("/")
def health_check():
    return {"status": "ok"}
