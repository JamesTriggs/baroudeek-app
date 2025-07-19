from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import get_db
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse, UserStats
from app.core.security import verify_password, get_password_hash, create_access_token, verify_token
import uuid
import json
from datetime import datetime, timezone

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Debug logging
    print(f"Registration attempt for email: {user_data.email}")
    print(f"Username: {user_data.username}")
    
    # Check if user already exists using raw SQL
    existing_user = db.execute(text("""
        SELECT id FROM users 
        WHERE email = :email OR username = :username
    """), {"email": user_data.email, "username": user_data.username}).fetchone()
    
    if existing_user:
        print(f"User already exists")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )
    
    # Create new user using raw SQL
    print("Creating new user...")
    hashed_password = get_password_hash(user_data.password)
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    try:
        db.execute(text("""
            INSERT INTO users (
                id, email, username, hashed_password, is_active, full_name, bio, 
                preferences, total_routes, total_distance, contribution_points, 
                ratings_given, created_at, last_active
            ) VALUES (
                :id, :email, :username, :hashed_password, :is_active, :full_name, :bio,
                :preferences, :total_routes, :total_distance, :contribution_points,
                :ratings_given, :created_at, :last_active
            )
        """), {
            "id": user_id,
            "email": user_data.email,
            "username": user_data.username,
            "hashed_password": hashed_password,
            "is_active": True,
            "full_name": user_data.full_name,
            "bio": user_data.bio,
            "preferences": '{"avoid_busy_roads": true, "prefer_smooth_surface": true, "max_gradient": 8, "route_type": "safest"}',
            "total_routes": 0,
            "total_distance": 0,
            "contribution_points": 0,
            "ratings_given": 0,
            "created_at": now,
            "last_active": now
        })
        db.commit()
        print(f"User created successfully with ID: {user_id}")
    except Exception as e:
        print(f"Error creating user: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user_data.email})
    
    return Token(
        access_token=access_token,
        user=UserResponse(
            id=user_id,
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            bio=user_data.bio,
            preferences={"avoid_busy_roads": True, "prefer_smooth_surface": True, "max_gradient": 8, "route_type": "safest"},
            stats=UserStats(
                total_routes=0,
                total_distance=0,
                contribution_points=0,
                ratings_given=0
            ),
            created_at=datetime.now(timezone.utc)
        )
    )

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    # Debug logging
    print(f"Login attempt for email: {user_credentials.email}")
    
    # Get user by email using raw SQL
    user = db.execute(text("""
        SELECT id, email, username, hashed_password, is_active, full_name, bio, 
               preferences, total_routes, total_distance, contribution_points, ratings_given
        FROM users 
        WHERE email = :email
    """), {"email": user_credentials.email}).fetchone()
    
    print(f"User found: {user is not None}")
    
    if user:
        print(f"User active: {user.is_active}")
        password_valid = verify_password(user_credentials.password, user.hashed_password)
        print(f"Password valid: {password_valid}")
    
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    
    return Token(
        access_token=access_token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            bio=user.bio,
            preferences=json.loads(user.preferences) if user.preferences else {},
            stats=UserStats(
                total_routes=user.total_routes,
                total_distance=user.total_distance,
                contribution_points=user.contribution_points,
                ratings_given=user.ratings_given
            ),
            created_at=datetime.now(timezone.utc)
        )
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token_data = verify_token(credentials.credentials)
    
    user = db.execute(text("""
        SELECT id, email, username, full_name, bio, preferences, 
               total_routes, total_distance, contribution_points, ratings_given, created_at
        FROM users 
        WHERE email = :email
    """), {"email": token_data["sub"]}).fetchone()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        bio=user.bio,
        preferences=json.loads(user.preferences) if user.preferences else {},
        stats=UserStats(
            total_routes=user.total_routes,
            total_distance=user.total_distance,
            contribution_points=user.contribution_points,
            ratings_given=user.ratings_given
        ),
        created_at=datetime.now(timezone.utc)  # Use current time as fallback
    )

@router.post("/logout")
async def logout():
    return {"message": "Successfully logged out"}