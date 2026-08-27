from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.orm import Session
from database import engine, get_db
from models import Base, User, Avatar
from schemas import RegisterRequest, LoginRequest, AvatarUpdateRequest
from auth import hash_password, verify_password, create_access_token, verify_access_token, get_current_user

app = FastAPI()
security = HTTPBearer()

Base.metadata.create_all(engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/users")
def get_users():
    with engine.connect() as connection:
        result = connection.execute(select(User))

        users = []

        for user in result:
            users.append({
                "id": user.id,
                "username": user.username,
                "created_at": user.created_at
            })

        return users

@app.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    user = db.execute(
        select(User).where(request.username == User.username)
        ).scalar_one_or_none()

    if user is not None:
        raise HTTPException(
            status_code=409,
            detail="Username already taken"
        )
    
    hashed_password = hash_password(request.password)

    user = User(
        username = request.username,
        password_hash = hashed_password
    )

    try:
        db.add(user)
        db.flush()

        avatar = Avatar(
            user_id = user.id,
            hair = 1,
            shirt = 1,
            hat = 1,
            skin_color = 1
        )

        db.add(avatar)
        db.commit()
    except:
        db.rollback()
        raise

    return {
        "message": "Registration successful",
        "username": user.username
    }

@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    username = request.username.strip()
    user = db.execute(
        select(User).where(User.username == username)
    ).scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    token = create_access_token(user.id)

    return {"access_token": token}

@app.get("/profile")
def profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "created_at": current_user.created_at,
        "avatar": {
            "hair": current_user.avatar.hair,
            "shirt": current_user.avatar.shirt,
            "hat": current_user.avatar.hat,
            "skin_color": current_user.avatar.skin_color
        }
    }

@app.put("/avatar")
def update_avatar(
    request: AvatarUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    avatar = db.execute(
        select(Avatar).where(Avatar.user_id == current_user.id)
    ).scalar_one_or_none()

    if avatar is None:
        raise HTTPException(
            status_code=404,
            detail="Avatar not found"
        )

    avatar.hair = request.hair
    avatar.shirt = request.shirt
    avatar.hat = request.hat
    avatar.skin_color = request.skin_color

    db.commit()

    return {
        "hair": avatar.hair,
        "shirt": avatar.shirt,
        "hat": avatar.hat,
        "skin_color": avatar.skin_color
    }