#!/usr/bin/env python3
"""
Simple database check without model relationships
"""
import sys
sys.path.append('/home/jjtriggs/cycleshare-app/backend')

from app.db.database import engine, get_db
from sqlalchemy import text
from sqlalchemy.orm import Session

def check_users_directly():
    """Check users directly with SQL"""
    try:
        db = next(get_db())
        
        # Count users
        result = db.execute(text("SELECT COUNT(*) FROM users"))
        count = result.scalar()
        print(f"📊 Total users in database: {count}")
        
        # List all users
        result = db.execute(text("SELECT id, email, username, is_active FROM users"))
        users = result.fetchall()
        
        if users:
            print("Users in database:")
            for user in users:
                print(f"  - {user[1]} ({user[2]}) - Active: {user[3]} - ID: {user[0]}")
        else:
            print("No users found in database")
            
    except Exception as e:
        print(f"❌ Error checking users: {e}")

def create_test_user():
    """Create a test user directly with SQL"""
    try:
        db = next(get_db())
        
        # Check if test user already exists
        result = db.execute(text("SELECT id FROM users WHERE email = 'test@example.com'"))
        if result.fetchone():
            print("Test user already exists")
            return
        
        # Create test user
        from app.core.security import get_password_hash
        hashed_password = get_password_hash("testpass123")
        
        db.execute(text("""
            INSERT INTO users (id, email, username, hashed_password, is_active, full_name, bio, preferences, total_routes, total_distance, contribution_points, ratings_given, created_at, last_active)
            VALUES (
                :id, :email, :username, :hashed_password, :is_active, :full_name, :bio, :preferences, :total_routes, :total_distance, :contribution_points, :ratings_given, NOW(), NOW()
            )
        """), {
            'id': 'test-user-id',
            'email': 'test@example.com',
            'username': 'testuser',
            'hashed_password': hashed_password,
            'is_active': True,
            'full_name': None,
            'bio': None,
            'preferences': '{"avoid_busy_roads": true, "prefer_smooth_surface": true, "max_gradient": 8, "route_type": "safest"}',
            'total_routes': 0,
            'total_distance': 0,
            'contribution_points': 0,
            'ratings_given': 0
        })
        
        db.commit()
        print("✅ Test user created successfully")
        
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        db.rollback()

if __name__ == "__main__":
    print("=== Simple Database Check Tool ===")
    print()
    
    print("1. Checking users directly...")
    check_users_directly()
    print()
    
    print("2. Creating test user...")
    create_test_user()
    print()
    
    print("3. Checking users again...")
    check_users_directly()