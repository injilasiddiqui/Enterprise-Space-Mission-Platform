from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.schemas.auth_schema import (
    UserCreate,
    LoginRequest,
    UserResponse,
    TokenResponse,
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post(
    "/register",
    response_model=UserResponse,
    summary="Register User"
)
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    try:
        existing = (
            db.query(User)
            .filter(User.email == user.email)
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Email already exists."
            )

        new_user = User(
            full_name=user.full_name,
            email=user.email,
            password=hash_password(user.password),
            role=user.role,
            status="Active"
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return new_user

    except Exception as e:
        db.rollback()
        print("DATABASE ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="User Login"
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == form_data.username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not verify_password(
        form_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token(
        {
            "sub": user.email,
            "role": user.role,
            "user_id": user.id
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get(
    "/users",
    response_model=list[UserResponse],
    summary="List Users"
)
def get_users(
    db: Session = Depends(get_db)
):

    return db.query(User).all()