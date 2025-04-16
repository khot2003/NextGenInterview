import re
import jwt
import datetime
from fastapi import HTTPException, Depends, Request, Response
from fastapi.responses import JSONResponse
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
import os
from dotenv import load_dotenv
from app.database import users_collection
from app.models.user import UserCreate, UserLogin, ForgotPasswordRequest

# Load environment variables
load_dotenv()

# Secret key for JWT
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Password hashing and validation
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def is_valid_password(password: str) -> bool:
    """ Validate password (must contain uppercase, lowercase, number, special character). """
    return bool(re.match(r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$', password))

# Generate JWT token
def create_access_token(data: dict, expires_delta: int = ACCESS_TOKEN_EXPIRE_MINUTES):
    """ Generate JWT token with expiration. """
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# User signup
def create_user(user: UserCreate):
    existing_user = users_collection.find_one({"$or": [{"email": user.email}, {"username": user.username}]})
    if existing_user:
        return {"error": "User with this email or username already exists"}

    if not is_valid_password(user.password):
        return {"error": "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character"}

    hashed_password = hash_password(user.password)
    user_data = {
        "username": user.username.strip(),
        "email": user.email.strip().lower(),
       # "usn": user.usn.strip().upper(),
        "password": hashed_password
    }
    users_collection.insert_one(user_data)
    return {"message": "User created successfully"}

# User login (returns HTTP-only cookie instead of token in response body)
def authenticate_user(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email.strip().lower()})
    if not db_user or not verify_password(user.password, db_user["password"]):
        return {"error": "Invalid credentials"}

    token = create_access_token({"sub": db_user["email"]})

    # Set JWT as an HTTP-only cookie
    response = JSONResponse(content={"message": "Login successful"})
    response.set_cookie(
        key="authToken",
        value=token,
        httponly=True,  # Prevents JavaScript access (XSS protection)
        secure=True,  # Ensure HTTPS in production
        samesite="Strict",  # CSRF protection
        max_age=3600,  # 1 hour expiration
    )
    return response

# Get current logged-in user based on cookie
def get_current_user(request: Request):
    token = request.cookies.get("authToken")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user = users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return {"user_id": str(user["_id"]),"email": user["email"], "username": user["username"]}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Logout user by removing the authentication cookie
def logout():
    response = JSONResponse(content={"message": "Logged out successfully"})
    response.delete_cookie("authToken")  # Remove cookie
    return response

# Password reset functionality
def reset_password(data: ForgotPasswordRequest):
    user = users_collection.find_one({"email": data.email.strip().lower()})
    if not user:
        return {"error": "User not found"}

    if not is_valid_password(data.new_password):
        return {"error": "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character"}

    hashed_new_password = hash_password(data.new_password)
    users_collection.update_one({"email": data.email}, {"$set": {"password": hashed_new_password}})
    return {"message": "Password reset successful"}
