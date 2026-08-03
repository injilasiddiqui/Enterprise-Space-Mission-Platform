from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "Operator"


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    status: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str