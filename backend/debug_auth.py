#!/usr/bin/env python3
"""
Debug script to test authentication flow
"""
import sys
sys.path.append('/home/jjtriggs/cycleshare-app/backend')

from app.core.security import verify_password, get_password_hash
from app.db.database import get_db
from app.models.user import User
from sqlalchemy.orm import Session

def test_password_hashing():
    """Test password hashing and verification"""
    test_password = "testpass123"
    hashed = get_password_hash(test_password)
    print(f"Original password: {test_password}")
    print(f"Hashed password: {hashed}")
    print(f"Verification result: {verify_password(test_password, hashed)}")
    print(f"Wrong password verification: {verify_password('wrongpass', hashed)}")
    print()

def check_user_in_db(email: str):
    """Check if user exists in database and verify password"""
    db = next(get_db())
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        print(f"User found: {user.email}")
        print(f"Username: {user.username}")
        print(f"Is active: {user.is_active}")
        print(f"Hashed password: {user.hashed_password}")
        
        # Test password verification
        test_password = input("Enter the password you used to register: ")
        verification_result = verify_password(test_password, user.hashed_password)
        print(f"Password verification result: {verification_result}")
    else:
        print(f"User with email {email} not found in database")

if __name__ == "__main__":
    print("=== Authentication Debug Tool ===")
    
    # Test password hashing
    print("1. Testing password hashing...")
    test_password_hashing()
    
    # Check specific user
    print("2. Checking specific user...")
    email = input("Enter the email you registered with: ")
    check_user_in_db(email)