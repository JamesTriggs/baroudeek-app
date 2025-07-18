#!/usr/bin/env python3
"""
Check database connection and tables
"""
import sys
sys.path.append('/home/jjtriggs/cycleshare-app/backend')

from app.db.database import engine, get_db
from app.models.user import User
from sqlalchemy import text
from sqlalchemy.orm import Session

def check_database_connection():
    """Check if we can connect to the database"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Database connection successful")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def check_tables():
    """Check if tables exist"""
    try:
        with engine.connect() as conn:
            # Check if users table exists
            result = conn.execute(text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"))
            table_exists = result.scalar()
            
            if table_exists:
                print("✅ Users table exists")
                
                # Check table structure
                result = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'"))
                columns = result.fetchall()
                print("Table columns:")
                for col in columns:
                    print(f"  - {col[0]}: {col[1]}")
            else:
                print("❌ Users table does not exist")
                
    except Exception as e:
        print(f"❌ Error checking tables: {e}")

def check_user_count():
    """Check how many users are in the database"""
    try:
        db = next(get_db())
        count = db.query(User).count()
        print(f"📊 Total users in database: {count}")
        
        # List all users
        users = db.query(User).all()
        if users:
            print("Users in database:")
            for user in users:
                print(f"  - {user.email} ({user.username}) - Active: {user.is_active}")
        else:
            print("No users found in database")
            
    except Exception as e:
        print(f"❌ Error checking users: {e}")

if __name__ == "__main__":
    print("=== Database Check Tool ===")
    print()
    
    print("1. Checking database connection...")
    if check_database_connection():
        print()
        print("2. Checking tables...")
        check_tables()
        print()
        print("3. Checking users...")
        check_user_count()
    else:
        print("Cannot proceed - database connection failed")