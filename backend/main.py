from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
from models import Base
from routes.cards import router as cards_router

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


@app.get("/")
def health_check():
    return {"status": "ok"}
