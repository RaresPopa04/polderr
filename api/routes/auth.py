"""
Authentication API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Dict, Optional
import jwt
import bcrypt
from datetime import datetime, timedelta

from models.user import User, Permissions

router = APIRouter()
security = HTTPBearer()

# Secret key for JWT - in production, use environment variable
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# In-memory user storage (username -> User)
users_db: Dict[str, User] = {}

class SignupRequest(BaseModel):
    user_name: str
    password: str

class LoginRequest(BaseModel):
    user_name: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    user_name: str
    permissions: str

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    """Decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current user from JWT token"""
    token = credentials.credentials
    payload = decode_token(token)
    username = payload.get("sub")
    
    if username is None or username not in users_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return users_db[username]

@router.post("/signup", response_model=TokenResponse)
async def signup(request: SignupRequest):
    """
    Register a new user
    """
    # Check if user already exists
    if request.user_name in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Auto-assign permissions based on username
    username_lower = request.user_name.lower()
    if username_lower == "admin":
        permissions = Permissions.ADMIN
    elif username_lower == "editor" or username_lower == "user":
        permissions = Permissions.EDITOR
    elif username_lower == "reader":
        permissions = Permissions.READER
    else:
        # Default to READER for other usernames
        permissions = Permissions.READER
    
    # Create user with hashed password
    hashed_password = hash_password(request.password)
    user = User(
        user_name=request.user_name,
        password=hashed_password,
        permissions=permissions
    )
    
    # Store user
    users_db[request.user_name] = user
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.user_name}, expires_delta=access_token_expires
    )
    
    return TokenResponse(access_token=access_token, token_type="bearer")

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """
    Login user and return access token
    """
    # Check if user exists
    user = users_db.get(request.user_name)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.user_name}, expires_delta=access_token_expires
    )
    
    return TokenResponse(access_token=access_token, token_type="bearer")

@router.get("/user", response_model=UserResponse)
async def get_user(current_user: User = Depends(get_current_user)):
    """
    Get current user information (requires authentication)
    """
    return UserResponse(
        user_name=current_user.user_name,
        permissions=current_user.permissions.name
    )

