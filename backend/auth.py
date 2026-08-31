from pwdlib import PasswordHash
from dotenv import load_dotenv
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.orm import Session
from database import get_db
from models import User
import jwt
import os
import uuid

load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET")

security = HTTPBearer()

password_hash = PasswordHash.recommended()

active_sessions = {}

def hash_password(user_password):
    return password_hash.hash(user_password)

def verify_password(user_password, hashed_password):
    return password_hash.verify(user_password, hashed_password)

def create_access_token(user_id):
    session_id = str(uuid.uuid4())

    payload = {
        "sub": str(user_id),
        "session_id": session_id
    }

    active_sessions[user_id] = session_id

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm="HS256"
    )

def verify_access_token(token):
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: Session = Depends(get_db)
):
    token = credentials.credentials
    payload = verify_access_token(token)

    try:
        user_id = int(payload["sub"])
        session_id = payload["session_id"]
    except (KeyError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    if active_sessions.get(user_id) != session_id:
        raise HTTPException(
            status_code=401,
            detail="Session is no longer active"
        )

    user = db.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user