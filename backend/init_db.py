#!/usr/bin/env python3
"""
Initialize the database with required tables.
Run this script to set up the database for development.
"""

import sqlite3
import os
from pathlib import Path

def init_database():
    # Get the database path from the DATABASE_URL
    db_path = Path("baroudeek_dev.db")
    
    # Create database connection
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                username TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                is_verified BOOLEAN DEFAULT FALSE,
                full_name TEXT,
                bio TEXT,
                avatar_url TEXT,
                preferences TEXT DEFAULT '{}',
                total_routes INTEGER DEFAULT 0,
                total_distance INTEGER DEFAULT 0,
                contribution_points INTEGER DEFAULT 0,
                ratings_given INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME,
                last_active DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create routes table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS routes (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                user_id TEXT NOT NULL,
                geometry TEXT,
                distance REAL NOT NULL,
                estimated_time INTEGER NOT NULL,
                difficulty TEXT NOT NULL,
                road_quality_score REAL DEFAULT 0.0,
                safety_score REAL DEFAULT 0.0,
                elevation_data TEXT,
                is_public BOOLEAN DEFAULT TRUE,
                is_featured BOOLEAN DEFAULT FALSE,
                tags TEXT DEFAULT '[]',
                view_count INTEGER DEFAULT 0,
                usage_count INTEGER DEFAULT 0,
                rating_avg REAL DEFAULT 0.0,
                rating_count INTEGER DEFAULT 0,
                waypoints TEXT DEFAULT '[]',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # Create indexes for better performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users (username)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_routes_user_id ON routes (user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_routes_created_at ON routes (created_at)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_routes_public ON routes (is_public)")
        
        conn.commit()
        print("✅ Database initialized successfully!")
        print(f"📁 Database location: {db_path.absolute()}")
        
        # Check if tables were created
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"📋 Created tables: {[table[0] for table in tables]}")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        conn.rollback()
        
    finally:
        conn.close()

if __name__ == "__main__":
    init_database()