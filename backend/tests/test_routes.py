import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timezone
import json

class TestRouteCreation:
    """Test route creation functionality."""
    
    def test_create_route_success(self, client: TestClient, sample_user_data):
        """Test successful route creation."""
        # First register and login to get token
        register_response = client.post("/auth/register", json=sample_user_data)
        token = register_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a route
        route_data = {
            "name": "Test Route",
            "description": "A test cycling route",
            "waypoints": [
                {"id": "1", "lat": 51.505, "lng": -0.09, "address": "Start point"},
                {"id": "2", "lat": 51.51, "lng": -0.1, "address": "End point"}
            ],
            "distance": 5000.0,
            "estimated_time": 1200,
            "difficulty": "moderate",
            "is_public": True,
            "geometry": '{"type":"LineString","coordinates":[[-0.09,51.505],[-0.1,51.51]]}'
        }
        
        response = client.post("/routes/", json=route_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["name"] == route_data["name"]
        assert data["description"] == route_data["description"]
        assert data["distance"] == route_data["distance"]
        assert data["estimated_time"] == route_data["estimated_time"]
        assert data["difficulty"] == route_data["difficulty"]
        assert data["is_public"] == route_data["is_public"]
        assert len(data["waypoints"]) == 2
        assert data["waypoints"][0]["lat"] == 51.505
        assert data["waypoints"][0]["lng"] == -0.09
        assert data["id"] is not None
        assert data["user_id"] is not None

    def test_create_route_without_auth(self, client: TestClient):
        """Test route creation without authentication fails."""
        route_data = {
            "name": "Test Route",
            "waypoints": [{"id": "1", "lat": 51.505, "lng": -0.09}],
            "distance": 5000.0,
            "estimated_time": 1200,
            "difficulty": "moderate"
        }
        
        response = client.post("/routes/", json=route_data)
        assert response.status_code == 403

    def test_create_route_invalid_token(self, client: TestClient):
        """Test route creation with invalid token fails."""
        headers = {"Authorization": "Bearer invalid.token.here"}
        route_data = {
            "name": "Test Route",
            "waypoints": [{"id": "1", "lat": 51.505, "lng": -0.09}],
            "distance": 5000.0,
            "estimated_time": 1200,
            "difficulty": "moderate"
        }
        
        response = client.post("/routes/", json=route_data, headers=headers)
        assert response.status_code == 401

    def test_create_route_missing_required_fields(self, client: TestClient, sample_user_data):
        """Test route creation with missing required fields fails."""
        # Register and login
        register_response = client.post("/auth/register", json=sample_user_data)
        token = register_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Missing required fields
        incomplete_route = {
            "name": "Test Route"
            # Missing waypoints, distance, estimated_time
        }
        
        response = client.post("/routes/", json=incomplete_route, headers=headers)
        assert response.status_code == 422

class TestRouteRetrieval:
    """Test route retrieval functionality."""
    
    def test_get_user_routes_empty(self, client: TestClient, sample_user_data):
        """Test getting user routes when none exist."""
        # Register and login
        register_response = client.post("/auth/register", json=sample_user_data)
        token = register_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = client.get("/routes/", headers=headers)
        
        assert response.status_code == 200
        assert response.json() == []

    def test_get_user_routes_with_data(self, client: TestClient, sample_user_data):
        """Test getting user routes when routes exist."""
        # Register and login
        register_response = client.post("/auth/register", json=sample_user_data)
        token = register_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a route
        route_data = {
            "name": "Test Route",
            "description": "A test route",
            "waypoints": [
                {"id": "1", "lat": 51.505, "lng": -0.09},
                {"id": "2", "lat": 51.51, "lng": -0.1}
            ],
            "distance": 5000.0,
            "estimated_time": 1200,
            "difficulty": "moderate",
            "is_public": True
        }
        
        create_response = client.post("/routes/", json=route_data, headers=headers)
        assert create_response.status_code == 200
        
        # Get user routes
        response = client.get("/routes/", headers=headers)
        
        assert response.status_code == 200
        routes = response.json()
        assert len(routes) == 1
        assert routes[0]["name"] == "Test Route"

    def test_get_specific_route(self, client: TestClient, sample_user_data):
        """Test getting a specific route by ID."""
        # Register and login
        register_response = client.post("/auth/register", json=sample_user_data)
        token = register_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a route
        route_data = {
            "name": "Specific Route",
            "waypoints": [{"id": "1", "lat": 51.505, "lng": -0.09}],
            "distance": 3000.0,
            "estimated_time": 900,
            "difficulty": "easy"
        }
        
        create_response = client.post("/routes/", json=route_data, headers=headers)
        created_route = create_response.json()
        route_id = created_route["id"]
        
        # Get specific route
        response = client.get(f"/routes/{route_id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == route_id
        assert data["name"] == "Specific Route"

    def test_get_nonexistent_route(self, client: TestClient, sample_user_data):
        """Test getting a route that doesn't exist."""
        # Register and login
        register_response = client.post("/auth/register", json=sample_user_data)
        token = register_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        fake_route_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/routes/{fake_route_id}", headers=headers)
        
        assert response.status_code == 404

class TestRouteUpdate:
    """Test route update functionality."""
    
    def test_update_route_success(self, client: TestClient, sample_user_data):
        """Test successful route update."""
        # Register and login
        register_response = client.post("/auth/register", json=sample_user_data)
        token = register_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a route
        route_data = {
            "name": "Original Route",
            "description": "Original description",
            "waypoints": [{"id": "1", "lat": 51.505, "lng": -0.09}],
            "distance": 5000.0,
            "estimated_time": 1200,
            "difficulty": "moderate",
            "is_public": True
        }
        
        create_response = client.post("/routes/", json=route_data, headers=headers)
        route_id = create_response.json()["id"]
        
        # Update the route
        update_data = {
            "name": "Updated Route",
            "description": "Updated description",
            "is_public": False
        }
        
        response = client.put(f"/routes/{route_id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Route"
        assert data["description"] == "Updated description"
        assert data["is_public"] == False

    def test_update_nonexistent_route(self, client: TestClient, sample_user_data):
        """Test updating a route that doesn't exist."""
        # Register and login
        register_response = client.post("/auth/register", json=sample_user_data)
        token = register_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        fake_route_id = "00000000-0000-0000-0000-000000000000"
        update_data = {"name": "Updated Route"}
        
        response = client.put(f"/routes/{fake_route_id}", json=update_data, headers=headers)
        assert response.status_code == 404

    def test_update_other_users_route(self, client: TestClient, sample_user_data):
        """Test updating another user's route fails."""
        # Register first user and create route
        user1_data = sample_user_data.copy()
        register1_response = client.post("/auth/register", json=user1_data)
        token1 = register1_response.json()["access_token"]
        headers1 = {"Authorization": f"Bearer {token1}"}
        
        route_data = {
            "name": "User1 Route",
            "waypoints": [{"id": "1", "lat": 51.505, "lng": -0.09}],
            "distance": 5000.0,
            "estimated_time": 1200,
            "difficulty": "moderate"
        }
        
        create_response = client.post("/routes/", json=route_data, headers=headers1)
        route_id = create_response.json()["id"]
        
        # Register second user
        user2_data = sample_user_data.copy()
        user2_data["email"] = "user2@example.com"
        user2_data["username"] = "user2"
        register2_response = client.post("/auth/register", json=user2_data)
        token2 = register2_response.json()["access_token"]
        headers2 = {"Authorization": f"Bearer {token2}"}
        
        # Try to update user1's route as user2
        update_data = {"name": "Hacked Route"}
        response = client.put(f"/routes/{route_id}", json=update_data, headers=headers2)
        
        assert response.status_code == 404  # Not found because it doesn't belong to user2

    def test_update_route_empty_payload(self, client: TestClient, sample_user_data):
        """Test updating route with empty payload fails."""
        # Register and login
        register_response = client.post("/auth/register", json=sample_user_data)
        token = register_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a route
        route_data = {
            "name": "Test Route",
            "waypoints": [{"id": "1", "lat": 51.505, "lng": -0.09}],
            "distance": 5000.0,
            "estimated_time": 1200,
            "difficulty": "moderate"
        }
        
        create_response = client.post("/routes/", json=route_data, headers=headers)
        route_id = create_response.json()["id"]
        
        # Try to update with empty payload
        response = client.put(f"/routes/{route_id}", json={}, headers=headers)
        assert response.status_code == 400

class TestRouteDeletion:
    """Test route deletion functionality."""
    
    def test_delete_route_success(self, client: TestClient, sample_user_data):
        """Test successful route deletion."""
        # Register and login
        register_response = client.post("/auth/register", json=sample_user_data)
        token = register_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a route
        route_data = {
            "name": "Route to Delete",
            "waypoints": [{"id": "1", "lat": 51.505, "lng": -0.09}],
            "distance": 5000.0,
            "estimated_time": 1200,
            "difficulty": "moderate"
        }
        
        create_response = client.post("/routes/", json=route_data, headers=headers)
        route_id = create_response.json()["id"]
        
        # Delete the route
        response = client.delete(f"/routes/{route_id}", headers=headers)
        
        assert response.status_code == 200
        assert "successfully" in response.json()["message"].lower()
        
        # Verify route is deleted
        get_response = client.get(f"/routes/{route_id}", headers=headers)
        assert get_response.status_code == 404

    def test_delete_nonexistent_route(self, client: TestClient, sample_user_data):
        """Test deleting a route that doesn't exist."""
        # Register and login
        register_response = client.post("/auth/register", json=sample_user_data)
        token = register_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        fake_route_id = "00000000-0000-0000-0000-000000000000"
        response = client.delete(f"/routes/{fake_route_id}", headers=headers)
        
        assert response.status_code == 404

    def test_delete_other_users_route(self, client: TestClient, sample_user_data):
        """Test deleting another user's route fails."""
        # Register first user and create route
        user1_data = sample_user_data.copy()
        register1_response = client.post("/auth/register", json=user1_data)
        token1 = register1_response.json()["access_token"]
        headers1 = {"Authorization": f"Bearer {token1}"}
        
        route_data = {
            "name": "User1 Route",
            "waypoints": [{"id": "1", "lat": 51.505, "lng": -0.09}],
            "distance": 5000.0,
            "estimated_time": 1200,
            "difficulty": "moderate"
        }
        
        create_response = client.post("/routes/", json=route_data, headers=headers1)
        route_id = create_response.json()["id"]
        
        # Register second user
        user2_data = sample_user_data.copy()
        user2_data["email"] = "user2@example.com"
        user2_data["username"] = "user2"
        register2_response = client.post("/auth/register", json=user2_data)
        token2 = register2_response.json()["access_token"]
        headers2 = {"Authorization": f"Bearer {token2}"}
        
        # Try to delete user1's route as user2
        response = client.delete(f"/routes/{route_id}", headers=headers2)
        
        assert response.status_code == 404  # Not found because it doesn't belong to user2

class TestRouteIntegration:
    """Integration tests for complete route workflows."""
    
    def test_complete_route_lifecycle(self, client: TestClient, sample_user_data):
        """Test complete route lifecycle: create -> read -> update -> delete."""
        # Register and login
        register_response = client.post("/auth/register", json=sample_user_data)
        token = register_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 1. Create route
        route_data = {
            "name": "Lifecycle Route",
            "description": "Testing complete lifecycle",
            "waypoints": [
                {"id": "1", "lat": 51.505, "lng": -0.09, "address": "Start"},
                {"id": "2", "lat": 51.51, "lng": -0.1, "address": "End"}
            ],
            "distance": 7500.0,
            "estimated_time": 1800,
            "difficulty": "hard",
            "is_public": True
        }
        
        create_response = client.post("/routes/", json=route_data, headers=headers)
        assert create_response.status_code == 200
        route_id = create_response.json()["id"]
        
        # 2. Read route
        get_response = client.get(f"/routes/{route_id}", headers=headers)
        assert get_response.status_code == 200
        assert get_response.json()["name"] == "Lifecycle Route"
        
        # 3. Update route
        update_data = {
            "name": "Updated Lifecycle Route",
            "description": "Updated description",
            "is_public": False
        }
        update_response = client.put(f"/routes/{route_id}", json=update_data, headers=headers)
        assert update_response.status_code == 200
        assert update_response.json()["name"] == "Updated Lifecycle Route"
        assert update_response.json()["is_public"] == False
        
        # 4. Verify in user routes list
        list_response = client.get("/routes/", headers=headers)
        assert list_response.status_code == 200
        user_routes = list_response.json()
        assert len(user_routes) == 1
        assert user_routes[0]["name"] == "Updated Lifecycle Route"
        
        # 5. Delete route
        delete_response = client.delete(f"/routes/{route_id}", headers=headers)
        assert delete_response.status_code == 200
        
        # 6. Verify deletion
        get_after_delete = client.get(f"/routes/{route_id}", headers=headers)
        assert get_after_delete.status_code == 404
        
        list_after_delete = client.get("/routes/", headers=headers)
        assert list_after_delete.status_code == 200
        assert len(list_after_delete.json()) == 0
    
    def test_multiple_users_separate_routes(self, client: TestClient, sample_user_data):
        """Test that users can only see their own routes."""
        # Register user 1
        user1_data = sample_user_data.copy()
        register1_response = client.post("/auth/register", json=user1_data)
        token1 = register1_response.json()["access_token"]
        headers1 = {"Authorization": f"Bearer {token1}"}
        
        # Register user 2
        user2_data = sample_user_data.copy()
        user2_data["email"] = "user2@example.com"
        user2_data["username"] = "user2"
        register2_response = client.post("/auth/register", json=user2_data)
        token2 = register2_response.json()["access_token"]
        headers2 = {"Authorization": f"Bearer {token2}"}
        
        # User 1 creates route
        route1_data = {
            "name": "User 1 Route",
            "waypoints": [{"id": "1", "lat": 51.505, "lng": -0.09}],
            "distance": 5000.0,
            "estimated_time": 1200,
            "difficulty": "moderate"
        }
        create1_response = client.post("/routes/", json=route1_data, headers=headers1)
        assert create1_response.status_code == 200
        
        # User 2 creates route
        route2_data = {
            "name": "User 2 Route",
            "waypoints": [{"id": "1", "lat": 52.505, "lng": -1.09}],
            "distance": 8000.0,
            "estimated_time": 2000,
            "difficulty": "hard"
        }
        create2_response = client.post("/routes/", json=route2_data, headers=headers2)
        assert create2_response.status_code == 200
        
        # User 1 should only see their route
        list1_response = client.get("/routes/", headers=headers1)
        user1_routes = list1_response.json()
        assert len(user1_routes) == 1
        assert user1_routes[0]["name"] == "User 1 Route"
        
        # User 2 should only see their route
        list2_response = client.get("/routes/", headers=headers2)
        user2_routes = list2_response.json()
        assert len(user2_routes) == 1
        assert user2_routes[0]["name"] == "User 2 Route"