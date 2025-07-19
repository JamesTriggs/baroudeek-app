#!/usr/bin/env python3
"""
Road-Focused Elevation Scraper for Baroudique

Intelligently scrapes elevation data only for roads where cyclists actually travel.
Reduces storage requirements by 99% while providing better cycling-specific data.
"""

import asyncio
import aiohttp
import sqlite3
import json
import math
import time
import logging
from dataclasses import dataclass, asdict
from typing import List, Tuple, Optional, Dict
import geopy.distance
from shapely.geometry import LineString, Point
import overpy

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class RoadSegment:
    osm_way_id: int
    road_type: str
    coordinates: List[Tuple[float, float]]  # [(lat, lng), ...]
    surface: Optional[str] = None
    name: Optional[str] = None
    country: Optional[str] = None
    length_meters: float = 0.0

@dataclass
class ElevationSample:
    lat: float
    lng: float
    elevation: float
    distance_along_road: float
    gradient: Optional[float] = None
    local_max_gradient: Optional[float] = None

@dataclass
class RoadElevationProfile:
    segment_id: str
    osm_way_id: int
    road_type: str
    surface: str
    length_meters: float
    elevation_samples: List[ElevationSample]
    min_elevation: float
    max_elevation: float
    total_ascent: float
    total_descent: float
    max_gradient: float
    avg_gradient: float
    cycling_suitability_score: float

class OSMRoadExtractor:
    """Extracts cyclable roads from OpenStreetMap"""
    
    def __init__(self):
        self.api = overpy.Overpass()
        
        # Define cyclable road types
        self.cyclable_highways = [
            'cycleway',      # Dedicated bike paths
            'primary',       # Major roads (usually have shoulders)
            'secondary',     # Regional roads
            'tertiary',      # Local connector roads
            'residential',   # Neighborhood streets
            'unclassified',  # Minor public roads
            'service',       # Access roads (some are cyclable)
            'track',         # Unpaved roads (mountain biking)
            'path'           # Multi-use paths
        ]
        
        # Roads to avoid
        self.avoid_highways = [
            'motorway',      # Cycling prohibited
            'trunk',         # High-speed roads
            'motorway_link', # Highway ramps
            'trunk_link'     # High-speed connectors
        ]
    
    async def get_roads_in_bbox(self, bbox: Tuple[float, float, float, float], 
                               country_code: str = None) -> List[RoadSegment]:
        """
        Extract cyclable roads from a bounding box
        bbox = (min_lat, min_lng, max_lat, max_lng)
        """
        min_lat, min_lng, max_lat, max_lng = bbox
        
        # Build Overpass query for cyclable roads
        highway_filter = '|'.join(self.cyclable_highways)
        avoid_filter = '|'.join(self.avoid_highways)
        
        query = f"""
        [out:json][timeout:60][bbox:{min_lat},{min_lng},{max_lat},{max_lng}];
        (
          way["highway"~"^({highway_filter})$"]
             ["highway"!~"^({avoid_filter})$"]
             ["access"!="private"]
             ["access"!="no"];
        );
        out geom;
        """
        
        logger.info(f"Querying OSM for roads in bbox {bbox}")
        
        try:
            result = self.api.query(query)
            roads = []
            
            for way in result.ways:
                # Extract coordinates
                coordinates = [(float(node.lat), float(node.lon)) for node in way.nodes]
                
                if len(coordinates) < 2:
                    continue  # Skip invalid roads
                
                # Extract road metadata
                road_type = way.tags.get('highway', 'unknown')
                surface = way.tags.get('surface', 'unknown')
                name = way.tags.get('name', '')
                
                # Calculate road length
                length = self._calculate_road_length(coordinates)
                
                road = RoadSegment(
                    osm_way_id=way.id,
                    road_type=road_type,
                    coordinates=coordinates,
                    surface=surface,
                    name=name,
                    country=country_code,
                    length_meters=length
                )
                
                roads.append(road)
            
            logger.info(f"Found {len(roads)} cyclable roads in bbox")
            return roads
            
        except Exception as e:
            logger.error(f"Error querying OSM: {e}")
            return []
    
    def _calculate_road_length(self, coordinates: List[Tuple[float, float]]) -> float:
        """Calculate total length of road in meters"""
        total_length = 0.0
        
        for i in range(len(coordinates) - 1):
            point1 = coordinates[i]
            point2 = coordinates[i + 1]
            distance = geopy.distance.geodesic(point1, point2).meters
            total_length += distance
        
        return total_length

class RoadElevationScraper:
    """Scrapes elevation data specifically for road networks"""
    
    def __init__(self, elevation_api_url: str = 'https://api.open-elevation.com/api/v1/lookup'):
        self.elevation_api = elevation_api_url
        self.session = None
        self.request_count = 0
        self.rate_limit_delay = 1.0  # seconds between requests
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def sample_road_elevation(self, road: RoadSegment, 
                                  sample_interval: int = 20) -> RoadElevationProfile:
        """
        Sample elevation along a road at specified intervals
        
        Args:
            road: Road segment to sample
            sample_interval: Distance between samples in meters
        """
        logger.info(f"Sampling elevation for road {road.osm_way_id} ({road.length_meters:.0f}m)")
        
        # Generate sampling points along the road
        sample_points = self._generate_sample_points(road, sample_interval)
        
        # Get elevation for all sample points
        elevation_data = await self._get_elevation_batch(sample_points)
        
        # Create elevation samples with gradients
        elevation_samples = []
        for i, (point, elevation) in enumerate(zip(sample_points, elevation_data)):
            sample = ElevationSample(
                lat=point[0],
                lng=point[1], 
                elevation=elevation,
                distance_along_road=point[2]  # distance from start of road
            )
            
            # Calculate gradient to next point
            if i < len(elevation_data) - 1:
                next_elevation = elevation_data[i + 1]
                next_distance = sample_points[i + 1][2]
                
                rise = next_elevation - elevation
                run = next_distance - sample.distance_along_road
                
                if run > 0:
                    gradient = (rise / run) * 100  # Convert to percentage
                    sample.gradient = round(gradient, 2)
                    
                    # Local max gradient (looking ahead 100m)
                    local_gradients = []
                    for j in range(i, min(i + 5, len(elevation_data) - 1)):
                        if j + 1 < len(elevation_data):
                            local_rise = elevation_data[j + 1] - elevation_data[j]
                            local_run = sample_points[j + 1][2] - sample_points[j][2]
                            if local_run > 0:
                                local_gradients.append(abs((local_rise / local_run) * 100))
                    
                    if local_gradients:
                        sample.local_max_gradient = round(max(local_gradients), 2)
            
            elevation_samples.append(sample)
        
        # Calculate profile statistics
        elevations = [s.elevation for s in elevation_samples]
        gradients = [s.gradient for s in elevation_samples if s.gradient is not None]
        
        min_elevation = min(elevations)
        max_elevation = max(elevations)
        
        # Calculate total ascent/descent
        total_ascent = 0.0
        total_descent = 0.0
        for i in range(len(elevation_samples) - 1):
            elevation_diff = elevation_samples[i + 1].elevation - elevation_samples[i].elevation
            if elevation_diff > 0:
                total_ascent += elevation_diff
            else:
                total_descent += abs(elevation_diff)
        
        max_gradient = max(gradients) if gradients else 0.0
        avg_gradient = sum(gradients) / len(gradients) if gradients else 0.0
        
        # Calculate cycling suitability score
        cycling_score = self._calculate_cycling_suitability(road, max_gradient, avg_gradient)
        
        # Create unique segment ID
        segment_id = f"seg_{road.osm_way_id}_{hash(str(road.coordinates[:2]))}"
        
        profile = RoadElevationProfile(
            segment_id=segment_id,
            osm_way_id=road.osm_way_id,
            road_type=road.road_type,
            surface=road.surface or 'unknown',
            length_meters=road.length_meters,
            elevation_samples=elevation_samples,
            min_elevation=min_elevation,
            max_elevation=max_elevation,
            total_ascent=total_ascent,
            total_descent=total_descent,
            max_gradient=max_gradient,
            avg_gradient=avg_gradient,
            cycling_suitability_score=cycling_score
        )
        
        return profile
    
    def _generate_sample_points(self, road: RoadSegment, interval: int) -> List[Tuple[float, float, float]]:
        """Generate evenly spaced sampling points along road"""
        points = []
        
        # Create LineString from road coordinates
        line = LineString([(lng, lat) for lat, lng in road.coordinates])
        
        # Sample at regular intervals
        current_distance = 0.0
        total_length = road.length_meters
        
        while current_distance <= total_length:
            # Get point at current distance along line
            if current_distance == 0:
                # Start point
                lat, lng = road.coordinates[0]
            elif current_distance >= total_length:
                # End point
                lat, lng = road.coordinates[-1]
            else:
                # Interpolate point along line
                fraction = current_distance / total_length
                point_on_line = line.interpolate(fraction, normalized=True)
                lng, lat = point_on_line.x, point_on_line.y
            
            points.append((lat, lng, current_distance))
            current_distance += interval
        
        return points
    
    async def _get_elevation_batch(self, points: List[Tuple[float, float, float]]) -> List[float]:
        """Get elevation for a batch of points"""
        # Rate limiting
        await asyncio.sleep(self.rate_limit_delay)
        
        # Prepare API request
        locations = [{'latitude': lat, 'longitude': lng} for lat, lng, _ in points]
        
        try:
            async with self.session.post(
                self.elevation_api,
                json={'locations': locations},
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    elevations = []
                    
                    for result in data.get('results', []):
                        elevation = result.get('elevation')
                        if elevation is not None:
                            elevations.append(float(elevation))
                        else:
                            # Use interpolation or default if no data
                            elevations.append(0.0)  # Could be smarter here
                    
                    self.request_count += 1
                    return elevations
                else:
                    logger.error(f"Elevation API error: {response.status}")
                    return [0.0] * len(points)  # Return defaults
                    
        except Exception as e:
            logger.error(f"Error getting elevation data: {e}")
            return [0.0] * len(points)
    
    def _calculate_cycling_suitability(self, road: RoadSegment, max_gradient: float, avg_gradient: float) -> float:
        """Calculate cycling suitability score (0-100)"""
        score = 100.0
        
        # Gradient penalties
        if max_gradient > 20:
            score -= 40
        elif max_gradient > 15:
            score -= 25
        elif max_gradient > 10:
            score -= 15
        elif max_gradient > 6:
            score -= 5
        
        # Average gradient penalty
        if avg_gradient > 8:
            score -= 20
        elif avg_gradient > 5:
            score -= 10
        
        # Surface quality adjustments
        surface_scores = {
            'asphalt': 0,
            'paved': 0,
            'concrete': -5,
            'compacted': -10,
            'gravel': -15,
            'unpaved': -20,
            'dirt': -25,
            'sand': -30,
            'unknown': -5
        }
        score += surface_scores.get(road.surface, -10)
        
        # Road type bonuses/penalties
        road_type_scores = {
            'cycleway': 25,      # Dedicated bike infrastructure
            'residential': 10,   # Usually quiet
            'tertiary': 5,       # Often good for cycling
            'secondary': 0,      # Neutral
            'primary': -10,      # Can be busy
            'unclassified': -5,  # Variable quality
            'service': -5,       # Variable quality
            'track': -10,        # Usually unpaved
            'path': 15           # Often good for cycling
        }
        score += road_type_scores.get(road.road_type, 0)
        
        return max(0.0, min(100.0, score))

class RoadElevationDatabase:
    """Manages storage of road elevation data"""
    
    def __init__(self, db_path: str = "road_elevation.db"):
        self.db_path = db_path
        self.setup_database()
    
    def setup_database(self):
        """Create database schema for road elevation data"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS road_elevation_profiles (
                    segment_id TEXT PRIMARY KEY,
                    osm_way_id INTEGER,
                    road_type TEXT,
                    surface TEXT,
                    length_meters REAL,
                    min_elevation REAL,
                    max_elevation REAL,
                    total_ascent REAL,
                    total_descent REAL,
                    max_gradient REAL,
                    avg_gradient REAL,
                    cycling_suitability_score REAL,
                    elevation_samples TEXT,  -- JSON array of elevation samples
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_osm_way_id 
                ON road_elevation_profiles (osm_way_id)
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_road_type 
                ON road_elevation_profiles (road_type)
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_gradient 
                ON road_elevation_profiles (max_gradient)
            """)
            
            conn.commit()
    
    def save_road_profile(self, profile: RoadElevationProfile):
        """Save road elevation profile to database"""
        with sqlite3.connect(self.db_path) as conn:
            # Convert elevation samples to JSON
            samples_json = json.dumps([asdict(sample) for sample in profile.elevation_samples])
            
            conn.execute("""
                INSERT OR REPLACE INTO road_elevation_profiles 
                (segment_id, osm_way_id, road_type, surface, length_meters,
                 min_elevation, max_elevation, total_ascent, total_descent,
                 max_gradient, avg_gradient, cycling_suitability_score, elevation_samples)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                profile.segment_id,
                profile.osm_way_id,
                profile.road_type,
                profile.surface,
                profile.length_meters,
                profile.min_elevation,
                profile.max_elevation,
                profile.total_ascent,
                profile.total_descent,
                profile.max_gradient,
                profile.avg_gradient,
                profile.cycling_suitability_score,
                samples_json
            ))
            conn.commit()
    
    def get_stats(self) -> Dict:
        """Get database statistics"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM road_elevation_profiles")
            total_segments = cursor.fetchone()[0]
            
            cursor = conn.execute("SELECT SUM(length_meters) FROM road_elevation_profiles")
            total_length = cursor.fetchone()[0] or 0
            
            cursor = conn.execute("SELECT road_type, COUNT(*) FROM road_elevation_profiles GROUP BY road_type")
            road_types = dict(cursor.fetchall())
            
            return {
                'total_segments': total_segments,
                'total_length_km': total_length / 1000,
                'road_types': road_types
            }

# Priority regions for initial scraping
CYCLING_REGIONS = [
    {
        'name': 'Netherlands',
        'bbox': (50.7, 3.4, 53.6, 7.2),
        'country': 'NL',
        'priority': 1
    },
    {
        'name': 'Denmark', 
        'bbox': (54.5, 8.0, 57.8, 15.2),
        'country': 'DK',
        'priority': 1
    },
    {
        'name': 'London_Area',
        'bbox': (51.3, -0.5, 51.7, 0.3),
        'country': 'UK',
        'priority': 1
    },
    {
        'name': 'San_Francisco_Bay',
        'bbox': (37.2, -122.6, 37.9, -121.8),
        'country': 'US',
        'priority': 1
    }
]

async def main():
    """Main scraping process"""
    logger.info("Starting Road-Focused Elevation Scraper")
    
    # Initialize components
    osm_extractor = OSMRoadExtractor()
    db = RoadElevationDatabase()
    
    async with RoadElevationScraper() as scraper:
        for region in CYCLING_REGIONS:
            logger.info(f"Processing region: {region['name']}")
            
            # Get roads in this region
            roads = await osm_extractor.get_roads_in_bbox(
                region['bbox'], 
                region['country']
            )
            
            logger.info(f"Found {len(roads)} roads in {region['name']}")
            
            # Process each road
            for i, road in enumerate(roads):
                try:
                    # Sample elevation along road
                    profile = await scraper.sample_road_elevation(road)
                    
                    # Save to database
                    db.save_road_profile(profile)
                    
                    logger.info(f"Processed road {i+1}/{len(roads)}: {road.osm_way_id} "
                              f"({profile.max_gradient:.1f}% max gradient)")
                    
                    # Small delay to be nice to APIs
                    await asyncio.sleep(0.5)
                    
                except Exception as e:
                    logger.error(f"Error processing road {road.osm_way_id}: {e}")
                    continue
            
            # Show progress
            stats = db.get_stats()
            logger.info(f"Region {region['name']} complete! "
                       f"Total: {stats['total_segments']} segments, "
                       f"{stats['total_length_km']:.1f}km of roads")

if __name__ == "__main__":
    asyncio.run(main())