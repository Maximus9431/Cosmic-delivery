from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
import hmac
import hashlib
import os
from urllib.parse import parse_qs
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration: Fetch Token from environment
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")

def verify_telegram_data(init_data: str) -> dict:
    """Verifies the integrity of data received from Telegram WebApp"""
    try:
        data = dict(parse_qs(init_data))
        hash_value = data.get('hash')[0] if data.get('hash') else None
        
        if not hash_value:
            raise HTTPException(status_code=401, detail="No hash provided")
        
        # Remove hash for signature verification
        auth_data = {k: v[0] for k, v in data.items() if k != 'hash'}
        
        # Format verification string
        data_check_string = '\n'.join(
            f"{k}={auth_data[k]}" for k in sorted(auth_data.keys())
        )
        
        # Cryptographic verification
        secret_key = hmac.new(
            b"WebAppData",
            BOT_TOKEN.encode(),
            hashlib.sha256
        ).digest()
        
        computed_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if computed_hash != hash_value:
            raise HTTPException(status_code=401, detail="Invalid hash")
        
        return auth_data
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "Cosmic Delivery Backend Active"}

@app.post("/auth/verify")
async def verify_user(request: Request):
    """Authenticated user verification via Telegram initData"""
    data = await request.json()
    init_data = data.get("initData")
    
    if not init_data:
        raise HTTPException(status_code=400, detail="No initData provided")
    
    auth_data = verify_telegram_data(init_data)
    user_data = json.loads(auth_data.get('user', '{}'))
    
    return {
        "success": True,
        "user": user_data,
        "message": f"Welcome, {user_data.get('first_name', 'User')}!"
    }

@app.get("/user/me")
async def get_user(init_data: str = ""):
    """Retrieves current user profile and game progress"""
    if init_data:
        try:
            auth_data = verify_telegram_data(init_data)
            user_data = json.loads(auth_data.get('user', '{}'))
            user_id = user_data.get('id')
        except:
            # Development fallback
            user_id = 12345
    else:
        user_id = 12345
    
    return {
        "id": user_id,
        "username": "CosmicExplorer",
        "coins": 1000,
        "packages_delivered": 0,
        "dark_matter": 0,
        "unlocked_planets": [0],
        "upgrades": {}
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
