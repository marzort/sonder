from pydantic import BaseModel, field_validator, Field
from datetime import datetime

class RegisterRequest(BaseModel):
    username: str
    password: str

    @field_validator('username')
    @classmethod
    def validate_username(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError('Username cannot be blank')

        if ' ' in value:
            raise ValueError('Username cannot contain spaces')
        return value

    @field_validator('password')
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not value.strip():
            raise ValueError('Password cannot be blank')
        return value

class LoginRequest(BaseModel):
    username: str
    password: str

    @classmethod
    def validate_username(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError('Username cannot be blank')

        if ' ' in value:
            raise ValueError('Username cannot contain spaces')
        return value

    @field_validator('password')
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not value.strip():
            raise ValueError('Password cannot be blank')
        return value

class AvatarUpdateRequest(BaseModel):
    eyes: str
    mouth: str
    hair: str
    clothes: str
    skin_color: str
    hair_color: str
    clothes_color: str

class LocationUpdate(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    accuracy: float | None = Field(
        default=None,
        ge=0
    )

class LocationSharingUpdate(BaseModel):
    enabled: bool

class MeetingAvatarResponse(BaseModel):
    eyes: str
    mouth: str
    hair: str
    clothes: str
    skin_color: str
    hair_color: str
    clothes_color: str

class MeetingPersonResponse(BaseModel):
    id: int
    username: str
    greeting: str
    avatar: MeetingAvatarResponse

class MeetingResponse(BaseModel):
    id: int
    started_at: datetime
    viewed: bool
    other_user: MeetingPersonResponse