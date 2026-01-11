
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends, Header
from jose import jwt, JWTError
from passlib.context import CryptContext
import bcrypt
import hashlib
import base64
import os
from dotenv import load_dotenv
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Security

bearer = HTTPBearer()

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("EXPIRY"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory users (will be replaced with DB later, we will use MySQL or Supabase)
users_db = {}

def hash_password(password: str):
    # SHA256 → bcrypt → base64
    password_hash = hashlib.sha256(password.encode("utf-8")).digest()
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_hash, salt)
    return base64.b64encode(hashed).decode("utf-8")
    
def verify_password(password: str, hashed: str) -> bool:
    # SHA256
    password_hash = hashlib.sha256(password.encode("utf-8")).digest()
    # Decode stored hash from base64
    stored_hash = base64.b64decode(hashed.encode("utf-8"))
    return bcrypt.checkpw(password_hash, stored_hash)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# def decode_token(token: str):
#     return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

def verify_token(request: HTTPAuthorizationCredentials=Security(bearer)):
    token = request.credentials
    if not token or "." not in token:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing token"
        )

    try:
        verified_token = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return verified_token
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

# Utility: Token dependency

def get_current_user(authorization: str | None = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated. Missing token.")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
        

def admin_only(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return user
