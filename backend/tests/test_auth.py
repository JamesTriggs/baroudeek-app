import pytest
from fastapi.testclient import TestClient
from app.core.security import verify_password, get_password_hash, create_access_token, verify_token
from app.schemas.user import UserCreate, UserLogin
import json

class TestPasswordHashing:
    """Test password hashing and verification."""
    
    def test_password_hash_and_verify(self):
        """Test password hashing and verification works correctly."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        # Hash should be different from original password
        assert hashed != password
        
        # Verification should work
        assert verify_password(password, hashed) is True
        
        # Wrong password should fail
        assert verify_password("wrongpassword", hashed) is False
    
    def test_hash_same_password_twice_different_results(self):
        """Test that hashing the same password twice gives different results."""
        password = "testpassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # Hashes should be different (salt makes them unique)
        assert hash1 != hash2
        
        # But both should verify correctly
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True

class TestJWTTokens:
    """Test JWT token creation and verification."""
    
    def test_create_and_verify_token(self):
        """Test JWT token creation and verification."""
        data = {"sub": "test@example.com", "username": "testuser"}
        token = create_access_token(data)
        
        # Token should be a string
        assert isinstance(token, str)
        assert len(token) > 0
        
        # Verify token
        payload = verify_token(token)
        assert payload["sub"] == "test@example.com"
        assert "exp" in payload
    
    def test_verify_invalid_token(self):
        """Test that invalid tokens raise HTTPException."""
        invalid_token = "invalid.token.here"
        
        with pytest.raises(Exception):  # Should raise HTTPException
            verify_token(invalid_token)

class TestUserRegistration:
    """Test user registration endpoint."""
    
    def test_register_new_user_success(self, client: TestClient, sample_user_data):
        """Test successful user registration."""
        response = client.post("/auth/register", json=sample_user_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Should return access token and user data
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == sample_user_data["email"]
        assert data["user"]["username"] == sample_user_data["username"]
        assert data["user"]["full_name"] == sample_user_data["full_name"]
        assert data["user"]["bio"] == sample_user_data["bio"]
        
        # Should have default preferences and stats
        assert "preferences" in data["user"]
        assert "stats" in data["user"]
        assert data["user"]["stats"]["total_routes"] == 0
    
    def test_register_duplicate_email(self, client: TestClient, sample_user_data):
        """Test registration with duplicate email fails."""
        # Register first user
        client.post("/auth/register", json=sample_user_data)
        
        # Try to register again with same email
        response = client.post("/auth/register", json=sample_user_data)
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]
    
    def test_register_duplicate_username(self, client: TestClient, sample_user_data):
        """Test registration with duplicate username fails."""
        # Register first user
        client.post("/auth/register", json=sample_user_data)
        
        # Try to register with different email but same username
        duplicate_data = sample_user_data.copy()
        duplicate_data["email"] = "different@example.com"
        response = client.post("/auth/register", json=duplicate_data)
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]
    
    def test_register_invalid_email(self, client: TestClient, sample_user_data):
        """Test registration with invalid email fails."""
        invalid_data = sample_user_data.copy()
        invalid_data["email"] = "invalid-email"
        
        response = client.post("/auth/register", json=invalid_data)
        assert response.status_code == 422  # Validation error
    
    def test_register_missing_required_fields(self, client: TestClient):
        """Test registration with missing required fields fails."""
        incomplete_data = {
            "email": "test@example.com"
            # Missing username and password
        }
        
        response = client.post("/auth/register", json=incomplete_data)
        assert response.status_code == 422

class TestUserLogin:
    """Test user login endpoint."""
    
    def test_login_success(self, client: TestClient, sample_user_data, sample_login_data):
        """Test successful user login."""
        # First register a user
        client.post("/auth/register", json=sample_user_data)
        
        # Then login
        response = client.post("/auth/login", json=sample_login_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Should return access token and user data
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == sample_login_data["email"]
    
    def test_login_wrong_email(self, client: TestClient, sample_user_data):
        """Test login with wrong email fails."""
        # Register a user
        client.post("/auth/register", json=sample_user_data)
        
        # Try to login with wrong email
        wrong_login = {
            "email": "wrong@example.com",
            "password": sample_user_data["password"]
        }
        response = client.post("/auth/login", json=wrong_login)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
    
    def test_login_wrong_password(self, client: TestClient, sample_user_data, sample_login_data):
        """Test login with wrong password fails."""
        # Register a user
        client.post("/auth/register", json=sample_user_data)
        
        # Try to login with wrong password
        wrong_login = sample_login_data.copy()
        wrong_login["password"] = "wrongpassword"
        response = client.post("/auth/login", json=wrong_login)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
    
    def test_login_nonexistent_user(self, client: TestClient):
        """Test login with nonexistent user fails."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "somepassword"
        }
        response = client.post("/auth/login", json=login_data)
        
        assert response.status_code == 401

class TestCurrentUser:
    """Test get current user endpoint."""
    
    def test_get_current_user_success(self, client: TestClient, sample_user_data):
        """Test getting current user with valid token."""
        # Register and get token
        register_response = client.post("/auth/register", json=sample_user_data)
        token = register_response.json()["access_token"]
        
        # Get current user
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == sample_user_data["email"]
        assert data["username"] == sample_user_data["username"]
    
    def test_get_current_user_no_token(self, client: TestClient):
        """Test getting current user without token fails."""
        response = client.get("/auth/me")
        assert response.status_code == 403  # Forbidden
    
    def test_get_current_user_invalid_token(self, client: TestClient):
        """Test getting current user with invalid token fails."""
        headers = {"Authorization": "Bearer invalid.token.here"}
        response = client.get("/auth/me", headers=headers)
        assert response.status_code == 401

class TestLogout:
    """Test logout endpoint."""
    
    def test_logout_success(self, client: TestClient):
        """Test logout endpoint returns success message."""
        response = client.post("/auth/logout")
        assert response.status_code == 200
        assert "Successfully logged out" in response.json()["message"]

class TestAuthIntegration:
    """Integration tests for authentication flow."""
    
    def test_full_auth_flow(self, client: TestClient, sample_user_data, sample_login_data):
        """Test complete authentication flow: register -> login -> access protected route."""
        # 1. Register
        register_response = client.post("/auth/register", json=sample_user_data)
        assert register_response.status_code == 200
        register_token = register_response.json()["access_token"]
        
        # 2. Login 
        login_response = client.post("/auth/login", json=sample_login_data)
        assert login_response.status_code == 200
        login_token = login_response.json()["access_token"]
        
        # 3. Access protected route with both tokens
        for token in [register_token, login_token]:
            headers = {"Authorization": f"Bearer {token}"}
            response = client.get("/auth/me", headers=headers)
            assert response.status_code == 200
            assert response.json()["email"] == sample_user_data["email"]
        
        # 4. Logout (stateless, just returns message)
        logout_response = client.post("/auth/logout")
        assert logout_response.status_code == 200