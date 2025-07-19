from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import sqlite3
import math
from pydantic import BaseModel

router = APIRouter()

class ElevationRequest(BaseModel):
    locations: List[dict]  # [{"latitude": float, "longitude": float}]

class ElevationResponse(BaseModel):
    results: List[dict]  # [{"latitude": float, "longitude": float, "elevation": float}]

class ElevationService:
    def __init__(self, db_path: str = "../elevation-scraper/elevation.db"):
        self.db_path = db_path
    
    def get_elevation_batch(self, coordinates: List[tuple]) -> List[dict]:
        """Get elevation for multiple coordinates with intelligent fallback"""
        results = []
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                for lat, lng in coordinates:
                    elevation = self._get_elevation_with_interpolation(conn, lat, lng)
                    
                    results.append({
                        "latitude": lat,
                        "longitude": lng,
                        "elevation": elevation
                    })
                    
        except Exception as e:
            # If local database fails, could fallback to external API here
            raise HTTPException(status_code=500, detail=f"Elevation service error: {str(e)}")
        
        return results
    
    def _get_elevation_with_interpolation(self, conn, lat: float, lng: float) -> Optional[float]:
        """Get elevation with intelligent interpolation if exact point not available"""
        
        # Try exact match first (within 0.0001 degrees ≈ 10m)
        cursor = conn.execute("""
            SELECT elevation FROM elevation_data 
            WHERE lat BETWEEN ? AND ? 
            AND lng BETWEEN ? AND ?
            ORDER BY ABS(lat - ?) + ABS(lng - ?) ASC
            LIMIT 1
        """, (
            lat - 0.0001, lat + 0.0001,
            lng - 0.0001, lng + 0.0001,
            lat, lng
        ))
        
        result = cursor.fetchone()
        if result:
            return result[0]
        
        # If no close match, try broader search with interpolation
        cursor = conn.execute("""
            SELECT lat, lng, elevation FROM elevation_data 
            WHERE lat BETWEEN ? AND ? 
            AND lng BETWEEN ? AND ?
            ORDER BY ABS(lat - ?) + ABS(lng - ?) ASC
            LIMIT 4
        """, (
            lat - 0.01, lat + 0.01,  # ~1km radius
            lng - 0.01, lng + 0.01,
            lat, lng
        ))
        
        nearby_points = cursor.fetchall()
        
        if len(nearby_points) >= 3:
            # Use inverse distance weighting for interpolation
            return self._interpolate_elevation(lat, lng, nearby_points)
        elif len(nearby_points) > 0:
            # Return closest point
            return nearby_points[0][2]
        else:
            # No data available - could estimate based on region or return None
            return self._estimate_elevation(lat, lng)
    
    def _interpolate_elevation(self, target_lat: float, target_lng: float, points: List[tuple]) -> float:
        """Interpolate elevation using inverse distance weighting"""
        total_weight = 0
        weighted_elevation = 0
        
        for point_lat, point_lng, elevation in points:
            # Calculate distance
            distance = math.sqrt((target_lat - point_lat)**2 + (target_lng - point_lng)**2)
            
            if distance == 0:
                return elevation  # Exact match
            
            # Inverse distance weighting
            weight = 1 / (distance ** 2)
            weighted_elevation += elevation * weight
            total_weight += weight
        
        return weighted_elevation / total_weight if total_weight > 0 else 0
    
    def _estimate_elevation(self, lat: float, lng: float) -> float:
        """Rough elevation estimation based on geographic location"""
        # Very basic estimation - could be improved with regional data
        
        # Ocean areas
        if (lat < 0 and lng > 100 and lng < 180):  # Pacific
            return 0
        if (lat > 30 and lat < 70 and lng > -30 and lng < 40):  # Atlantic
            return 0
            
        # Mountain regions (rough estimates)
        if (lat > 25 and lat < 50 and lng > -125 and lng < -100):  # Rocky Mountains
            return 1500
        if (lat > 45 and lat < 48 and lng > 6 and lng < 15):  # Alps
            return 800
        if (lat > 27 and lat < 30 and lng > 86 and lng < 89):  # Himalayas
            return 4000
            
        # Default continental elevation
        return 200

# Initialize service
elevation_service = ElevationService()

@router.post("/lookup", response_model=ElevationResponse)
async def get_elevation(request: ElevationRequest):
    """
    Get elevation data for multiple coordinates
    
    Compatible with Open-Elevation API format for easy frontend integration
    """
    try:
        coordinates = [(loc["latitude"], loc["longitude"]) for loc in request.locations]
        results = elevation_service.get_elevation_batch(coordinates)
        
        return ElevationResponse(results=results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def elevation_health():
    """Health check for elevation service"""
    try:
        # Test with a known location
        test_results = elevation_service.get_elevation_batch([(51.4308, -0.9101)])  # London
        
        return {
            "status": "healthy",
            "database_accessible": True,
            "test_elevation": test_results[0]["elevation"] if test_results else None
        }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "error": str(e),
            "database_accessible": False
        }

@router.get("/stats")
async def elevation_stats():
    """Get statistics about the elevation database"""
    try:
        with sqlite3.connect(elevation_service.db_path) as conn:
            # Count total points
            cursor = conn.execute("SELECT COUNT(*) FROM elevation_data")
            total_points = cursor.fetchone()[0]
            
            # Count coverage by region
            cursor = conn.execute("""
                SELECT 
                    COUNT(*) as count,
                    MIN(lat) as min_lat, MAX(lat) as max_lat,
                    MIN(lng) as min_lng, MAX(lng) as max_lng
                FROM elevation_data
            """)
            coverage = cursor.fetchone()
            
            # Scraping progress
            cursor = conn.execute("""
                SELECT status, COUNT(*) 
                FROM scrape_progress 
                GROUP BY status
            """)
            progress = dict(cursor.fetchall())
            
            return {
                "total_elevation_points": total_points,
                "coverage_bounds": {
                    "lat_range": [coverage[1], coverage[2]],
                    "lng_range": [coverage[3], coverage[4]]
                },
                "scraping_progress": progress,
                "estimated_coverage_km2": total_points * 0.01  # Rough estimate
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))