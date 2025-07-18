from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse
from app.models.user import User
from app.core.security import verify_password, get_password_hash, create_access_token, verify_token

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Debug logging
    print(f"Registration attempt for email: {user_data.email}")
    print(f"Username: {user_data.username}")
    print(f"Full name: {user_data.full_name}")
    print(f"Bio: {user_data.bio}")
    
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        print(f"User already exists: {existing_user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )
    
    # Create new user
    print("Creating new user...")
    hashed_password = get_password_hash(user_data.password)
    print(f"Password hashed successfully")
    
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        bio=user_data.bio,
        hashed_password=hashed_password,
        is_active=True  # Default to True for new registrations
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        print(f"User created successfully with ID: {db_user.id}")
    except Exception as e:
        print(f"Error creating user: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": db_user.email})
    
    return Token(
        access_token=access_token,
        user=UserResponse(
            id=db_user.id,
            email=db_user.email,
            username=db_user.username,
            full_name=db_user.full_name,
            bio=db_user.bio,
            preferences=db_user.preferences,
            stats={
                "total_routes": db_user.total_routes,
                "total_distance": db_user.total_distance,
                "contribution_points": db_user.contribution_points,
                "ratings_given": db_user.ratings_given
            },
            created_at=db_user.created_at
        )
    )

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    # Get user by email
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    # Debug logging
    print(f"Login attempt for email: {user_credentials.email}")
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
            preferences=user.preferences,
            stats={
                "total_routes": user.total_routes,
                "total_distance": user.total_distance,
                "contribution_points": user.contribution_points,
                "ratings_given": user.ratings_given
            },
            created_at=user.created_at
        )
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token_data = verify_token(credentials.credentials)
    user = db.query(User).filter(User.email == token_data["sub"]).first()
    
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
        preferences=user.preferences,
        stats={
            "total_routes": user.total_routes,
            "total_distance": user.total_distance,
            "contribution_points": user.contribution_points,
            "ratings_given": user.ratings_given
        },
        created_at=user.created_at
    )

@router.post("/logout")
async def logout():
    return {"message": "Successfully logged out"}

# Helper function to get current user
async def get_current_user_dependency(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token_data = verify_token(credentials.credentials)
    user = db.query(User).filter(User.email == token_data["sub"]).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user