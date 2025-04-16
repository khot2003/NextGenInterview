from fastapi import APIRouter, HTTPException, Request, Response, Depends
from app.models.user import UserCreate, UserLogin, ForgotPasswordRequest
from app.services.auth_service import (
    create_user, authenticate_user, reset_password, get_current_user, logout
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup")
def signup(user: UserCreate):
    response = create_user(user)
    if "error" in response:
        raise HTTPException(status_code=400, detail=response["error"])
    return response

@router.post("/login")
def login(user: UserLogin):
    """ Logs in user and sets JWT as HTTP-only cookie. """
    return authenticate_user(user)  # Directly return response (sets cookie)

@router.get("/me")
def get_logged_in_user(request: Request):
    """ Returns current logged-in user based on authentication cookie. """
    return get_current_user(request)

@router.post("/logout")
def logout_user():
    """ Logs out user by clearing authentication cookie. """
    return logout()

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest):
    response = reset_password(request)
    if "error" in response:
        raise HTTPException(status_code=400, detail=response["error"])
    return response
