from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    #usn: str = Field(..., min_length=6, max_length=15)
    password: str = Field(..., min_length=8, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str = Field(..., min_length=8, max_length=100)

class UserResponse(BaseModel):
    """ Used for returning user details safely (without password). """
    username: str
    email: EmailStr
   # usn: str

class AccessToken(BaseModel):
    """ Response model for returning login success message and token. """
    message: str
    access_token: str
    token_type: str = "bearer"
