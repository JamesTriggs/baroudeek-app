from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.models.route import Route
from app.models.waypoint import Waypoint
from app.schemas.route import WaypointCreate
import math

class RouteService:
    def __init__(self, db: Session):
        self.db = db
    
    async def calculate_route_metrics(self, route_id: str) -> Route:
        """Calculate distance, time, and other metrics for a route."""
        route = self.db.query(Route).filter(Route.id == route_id).first()
        if not route:
            raise ValueError("Route not found")
        
        waypoints = self.db.query(Waypoint).filter(
            Waypoint.route_id == route_id
        ).order_by(Waypoint.order).all()
        
        if len(waypoints) < 2:
            return route
        
        # Calculate total distance
        total_distance = 0
        for i in range(len(waypoints) - 1):
            current_wp = waypoints[i]
            next_wp = waypoints[i + 1]
            
            # Extract coordinates from PostGIS POINT geometry
            # This is a simplified calculation - in production, use proper routing
            lat1, lng1 = self._extract_coordinates(current_wp.point)
            lat2, lng2 = self._extract_coordinates(next_wp.point)
            
            distance = self._calculate_distance(lat1, lng1, lat2, lng2)
            total_distance += distance
        
        # Update route metrics
        route.distance = total_distance
        route.estimated_time = self._calculate_estimated_time(total_distance)
        route.difficulty = self._calculate_difficulty(total_distance)
        route.road_quality_score = 75.0  # Placeholder
        route.safety_score = 80.0  # Placeholder
        
        self.db.commit()
        self.db.refresh(route)
        
        return route
    
    async def generate_optimized_route(
        self, 
        waypoints: List[WaypointCreate], 
        preferences: Dict[str, Any],
        user_id: str
    ) -> Route:
        """Generate an optimized route based on waypoints and preferences."""
        # Create a new route
        route = Route(
            name="Generated Route",
            description="Auto-generated cycling route",
            user_id=user_id,
            distance=0.0,
            estimated_time=0,
            difficulty="moderate",
            road_quality_score=0.0,
            safety_score=0.0
        )
        
        self.db.add(route)
        self.db.commit()
        self.db.refresh(route)
        
        # Create waypoints
        for i, waypoint_data in enumerate(waypoints):
            db_waypoint = Waypoint(
                route_id=route.id,
                point=f"POINT({waypoint_data.lng} {waypoint_data.lat})",
                address=waypoint_data.address,
                name=waypoint_data.name,
                type=waypoint_data.type,
                order=i,
                elevation=waypoint_data.elevation,
                notes=waypoint_data.notes
            )
            self.db.add(db_waypoint)
        
        self.db.commit()
        
        # Calculate route metrics
        return await self.calculate_route_metrics(route.id)
    
    def _extract_coordinates(self, point_geometry) -> tuple:
        """Extract lat/lng from PostGIS POINT geometry."""
        # This is a simplified extraction - in production, use proper GIS libraries
        # For now, return dummy coordinates
        return (51.5074, -0.1278)  # London coordinates as placeholder
    
    def _calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate distance between two points using Haversine formula."""
        R = 6371000  # Earth's radius in meters
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lng = math.radians(lng2 - lng1)
        
        a = (math.sin(delta_lat / 2) * math.sin(delta_lat / 2) +
             math.cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(delta_lng / 2) * math.sin(delta_lng / 2))
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    def _calculate_estimated_time(self, distance: float) -> int:
        """Calculate estimated time in seconds based on distance."""
        # Assume average cycling speed of 20 km/h
        average_speed_ms = 20 * 1000 / 3600  # 20 km/h in m/s
        return int(distance / average_speed_ms)
    
    def _calculate_difficulty(self, distance: float) -> str:
        """Calculate difficulty based on distance and other factors."""
        if distance < 5000:  # Less than 5km
            return "easy"
        elif distance < 20000:  # Less than 20km
            return "moderate"
        else:
            return "hard"