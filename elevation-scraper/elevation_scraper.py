#!/usr/bin/env python3
"""
Baroudique Elevation Database Builder

Builds a comprehensive elevation database by intelligently scraping free elevation data sources.
Designed to run continuously in the background, prioritizing populated areas and cycling routes.
"""

import asyncio
import aiohttp
import sqlite3
import json
import time
import logging
from dataclasses import dataclass
from typing import List, Tuple, Optional
from pathlib import Path
import gzip
import math

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('elevation_scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class ElevationPoint:
    lat: float
    lng: float
    elevation: float
    source: str
    accuracy: str  # 'high', 'medium', 'low'
    timestamp: int

@dataclass
class GridCell:
    lat_min: float
    lat_max: float
    lng_min: float
    lng_max: float
    priority: int  # 1=highest (cities), 5=lowest (oceans)

class ElevationDatabase:
    """Manages the local elevation database"""
    
    def __init__(self, db_path: str = "elevation.db"):
        self.db_path = db_path
        self.setup_database()
    
    def setup_database(self):
        """Create database tables if they don't exist"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS elevation_data (
                    lat REAL,
                    lng REAL,
                    elevation REAL,
                    source TEXT,
                    accuracy TEXT,
                    timestamp INTEGER,
                    PRIMARY KEY (lat, lng)
                )
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_location 
                ON elevation_data (lat, lng)
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS scrape_progress (
                    grid_id TEXT PRIMARY KEY,
                    lat_min REAL,
                    lat_max REAL,
                    lng_min REAL,
                    lng_max REAL,
                    status TEXT,  -- 'pending', 'in_progress', 'completed', 'failed'
                    priority INTEGER,
                    last_attempt INTEGER,
                    error_count INTEGER DEFAULT 0
                )
            """)
            
            conn.commit()
            logger.info("Database initialized")
    
    def add_elevation_points(self, points: List[ElevationPoint]):
        """Batch insert elevation points"""
        with sqlite3.connect(self.db_path) as conn:
            conn.executemany("""
                INSERT OR REPLACE INTO elevation_data 
                (lat, lng, elevation, source, accuracy, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            """, [
                (p.lat, p.lng, p.elevation, p.source, p.accuracy, p.timestamp)
                for p in points
            ])
            conn.commit()
    
    def get_elevation(self, lat: float, lng: float, radius: float = 0.001) -> Optional[float]:
        """Get elevation for a point, with optional radius search"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT elevation FROM elevation_data 
                WHERE lat BETWEEN ? AND ? 
                AND lng BETWEEN ? AND ?
                ORDER BY ABS(lat - ?) + ABS(lng - ?) ASC
                LIMIT 1
            """, (
                lat - radius, lat + radius,
                lng - radius, lng + radius,
                lat, lng
            ))
            
            result = cursor.fetchone()
            return result[0] if result else None
    
    def mark_grid_completed(self, grid_id: str):
        """Mark a grid cell as completed"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                UPDATE scrape_progress 
                SET status = 'completed', last_attempt = ?
                WHERE grid_id = ?
            """, (int(time.time()), grid_id))
            conn.commit()
    
    def get_next_grid(self) -> Optional[GridCell]:
        """Get the next highest priority grid cell to scrape"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT grid_id, lat_min, lat_max, lng_min, lng_max, priority
                FROM scrape_progress 
                WHERE status = 'pending' 
                AND (last_attempt IS NULL OR last_attempt < ?)
                AND error_count < 5
                ORDER BY priority ASC, last_attempt ASC
                LIMIT 1
            """, (int(time.time()) - 3600,))  # Retry failed after 1 hour
            
            result = cursor.fetchone()
            if result:
                return GridCell(
                    lat_min=result[1],
                    lat_max=result[2], 
                    lng_min=result[3],
                    lng_max=result[4],
                    priority=result[5]
                )
            return None

class ElevationScraper:
    """Scrapes elevation data from multiple sources"""
    
    def __init__(self, db: ElevationDatabase):
        self.db = db
        self.session = None
        
        # API endpoints (free tiers)
        self.apis = [
            {
                'name': 'open_elevation',
                'url': 'https://api.open-elevation.com/api/v1/lookup',
                'method': 'POST',
                'rate_limit': 1,  # requests per second
                'batch_size': 100,
                'accuracy': 'medium'
            }
        ]
        
        self.request_count = 0
        self.last_request_time = 0
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def scrape_grid_cell(self, grid: GridCell) -> bool:
        """Scrape elevation data for a grid cell"""
        try:
            # Generate sampling points (adaptive density based on priority)
            points_per_side = 10 if grid.priority <= 2 else 5
            lat_step = (grid.lat_max - grid.lat_min) / points_per_side
            lng_step = (grid.lng_max - grid.lng_min) / points_per_side
            
            coordinates = []
            for i in range(points_per_side + 1):
                for j in range(points_per_side + 1):
                    lat = grid.lat_min + (i * lat_step)
                    lng = grid.lng_min + (j * lng_step)
                    coordinates.append((lat, lng))
            
            # Scrape in batches
            elevation_points = []
            for api in self.apis:
                try:
                    points = await self._scrape_with_api(coordinates, api)
                    elevation_points.extend(points)
                    break  # Success with this API
                except Exception as e:
                    logger.warning(f"API {api['name']} failed for grid: {e}")
                    continue
            
            if elevation_points:
                self.db.add_elevation_points(elevation_points)
                logger.info(f"Scraped {len(elevation_points)} points for grid {grid.lat_min:.3f},{grid.lng_min:.3f}")
                return True
            else:
                logger.error(f"No elevation data obtained for grid {grid.lat_min:.3f},{grid.lng_min:.3f}")
                return False
                
        except Exception as e:
            logger.error(f"Error scraping grid: {e}")
            return False
    
    async def _scrape_with_api(self, coordinates: List[Tuple[float, float]], api: dict) -> List[ElevationPoint]:
        """Scrape elevation data using a specific API"""
        points = []
        batch_size = api['batch_size']
        
        for i in range(0, len(coordinates), batch_size):
            batch = coordinates[i:i + batch_size]
            
            # Rate limiting
            await self._rate_limit(api['rate_limit'])
            
            if api['name'] == 'open_elevation':
                locations = [{'latitude': lat, 'longitude': lng} for lat, lng in batch]
                
                async with self.session.post(
                    api['url'],
                    json={'locations': locations},
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        
                        for result in data.get('results', []):
                            if result.get('elevation') is not None:
                                points.append(ElevationPoint(
                                    lat=result['latitude'],
                                    lng=result['longitude'],
                                    elevation=result['elevation'],
                                    source=api['name'],
                                    accuracy=api['accuracy'],
                                    timestamp=int(time.time())
                                ))
                    else:
                        raise Exception(f"HTTP {response.status}")
        
        return points
    
    async def _rate_limit(self, requests_per_second: float):
        """Implement rate limiting"""
        min_interval = 1.0 / requests_per_second
        current_time = time.time()
        
        if current_time - self.last_request_time < min_interval:
            sleep_time = min_interval - (current_time - self.last_request_time)
            await asyncio.sleep(sleep_time)
        
        self.last_request_time = time.time()
        self.request_count += 1

class GridGenerator:
    """Generates prioritized grid cells for scraping"""
    
    @staticmethod
    def generate_world_grid(db: ElevationDatabase, grid_size: float = 0.01):
        """Generate grid cells for the entire world with priorities"""
        
        # Priority regions (cycling hotspots)
        priority_regions = [
            # Europe (major cycling regions)
            {'bounds': (35.0, 71.0, -10.0, 40.0), 'priority': 1},  # Europe
            {'bounds': (25.0, 49.0, -125.0, -66.0), 'priority': 1},  # USA
            {'bounds': (-45.0, -10.0, 113.0, 154.0), 'priority': 1},  # Australia
            {'bounds': (45.0, 85.0, -180.0, -50.0), 'priority': 2},  # Canada
            {'bounds': (14.0, 55.0, 68.0, 97.0), 'priority': 2},  # India
            {'bounds': (18.0, 54.0, 73.0, 135.0), 'priority': 2},  # China
            {'bounds': (30.0, 47.0, 129.0, 146.0), 'priority': 2},  # Japan
        ]
        
        grid_cells = []
        
        # Generate global grid
        for lat in range(-90, 90):
            for lng in range(-180, 180):
                lat_min = lat
                lat_max = lat + grid_size * 100  # Convert to degrees
                lng_min = lng  
                lng_max = lng + grid_size * 100
                
                # Determine priority
                priority = 5  # Default: lowest priority
                for region in priority_regions:
                    r_lat_min, r_lat_max, r_lng_min, r_lng_max = region['bounds']
                    if (r_lat_min <= lat_min <= r_lat_max and 
                        r_lng_min <= lng_min <= r_lng_max):
                        priority = region['priority']
                        break
                
                grid_id = f"{lat}_{lng}"
                grid_cells.append((
                    grid_id, lat_min, lat_max, lng_min, lng_max, 
                    'pending', priority, None, 0
                ))
        
        # Batch insert grid cells
        with sqlite3.connect(db.db_path) as conn:
            conn.executemany("""
                INSERT OR IGNORE INTO scrape_progress 
                (grid_id, lat_min, lat_max, lng_min, lng_max, status, priority, last_attempt, error_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, grid_cells)
            conn.commit()
        
        logger.info(f"Generated {len(grid_cells)} grid cells")

async def main():
    """Main scraper loop"""
    logger.info("Starting Baroudique Elevation Scraper")
    
    # Initialize database
    db = ElevationDatabase()
    
    # Generate grid (run once)
    # GridGenerator.generate_world_grid(db)
    
    # Start scraping
    async with ElevationScraper(db) as scraper:
        while True:
            try:
                # Get next grid cell
                grid = db.get_next_grid()
                
                if grid is None:
                    logger.info("No pending grid cells. Sleeping...")
                    await asyncio.sleep(60)
                    continue
                
                # Scrape the grid
                success = await scraper.scrape_grid_cell(grid)
                
                if success:
                    grid_id = f"{grid.lat_min}_{grid.lng_min}"
                    db.mark_grid_completed(grid_id)
                    logger.info(f"Completed grid {grid_id}")
                else:
                    logger.warning(f"Failed to scrape grid {grid.lat_min},{grid.lng_min}")
                
                # Small delay between grids
                await asyncio.sleep(1)
                
            except KeyboardInterrupt:
                logger.info("Scraper stopped by user")
                break
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(main())