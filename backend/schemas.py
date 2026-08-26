from pydantic import BaseModel

class RegisterRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class AvatarUpdateRequest(BaseModel):
    hair: int
    shirt: int
    hat: int
    skin_color: int