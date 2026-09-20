from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from database import engine
from models import Base

from routers.websocket import router as websocket_router, manager
from routers.health import router as health_router
from routers.register import router as register_router
from routers.login import router as login_router
from routers.logout import router as logout_router
from routers.avatar import router as avatar_router
from routers.users import router as users_router
from routers.profile import router as profile_router
from routers.location import router as location_router
from routers.meetings import router as meeting_router
from routers.garden import router as garden_router

app = FastAPI()
security = HTTPBearer()

app.include_router(websocket_router)
app.include_router(health_router)
app.include_router(register_router)
app.include_router(login_router)
app.include_router(logout_router)
app.include_router(avatar_router)
app.include_router(users_router)
app.include_router(profile_router)
app.include_router(location_router)
app.include_router(meeting_router)
app.include_router(garden_router)

Base.metadata.create_all(engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)