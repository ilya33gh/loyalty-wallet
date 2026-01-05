from fastapi import APIRouter, Request

router = APIRouter(prefix="/telegram", tags=["Telegram"])

@router.post("/init")
async def telegram_init(request: Request):
    data = await request.json()
    return {
        "status": "ok",
        "received": data
    }