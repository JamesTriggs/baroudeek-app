import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import tempfile
import os
from app.main import app
from app.db.database import get_db, Base
from app.core.config import settings

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={
        "check_same_thread": False,
    },
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def db_engine():
    """Create database engine for testing."""
    return engine

@pytest.fixture(scope="function")
def db_session(db_engine):
    """Create a fresh database session for each test."""
    # Create tables and clean them for each test
    with db_engine.connect() as connection:
        # Drop and recreate tables to ensure clean state
        connection.execute(text("DROP TABLE IF EXISTS routes"))
        connection.execute(text("DROP TABLE IF EXISTS users"))
        
        # Create users table
        connection.execute(text("""
            CREATE TABLE users (
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
        """))
        
        # Create routes table
        connection.execute(text("""
            CREATE TABLE routes (
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
        """))
        connection.commit()
    
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    """Create test client."""
    return TestClient(app)

@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpassword123",
        "full_name": "Test User",
        "bio": "A test cyclist"
    }

@pytest.fixture
def sample_login_data():
    """Sample login data for testing."""
    return {
        "email": "test@example.com",
        "password": "testpassword123"
    }