#!/usr/bin/env python3
"""
PostGIS Migration Script for Baroudique Elevation Database

Migrates from SQLite prototype to production PostGIS with spatial tiling.
"""

import asyncio
import asyncpg
import sqlite3
import gzip
import json
import math
import struct
from typing import List, Tuple, Optional
import logging
from dataclasses import dataclass

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class TileData:
    tile_id: str
    zoom_level: int
    x: int
    y: int
    bounds: Tuple[float, float, float, float]  # min_lat, min_lng, max_lat, max_lng
    elevation_grid: List[List[float]]
    min_elevation: float
    max_elevation: float
    avg_elevation: float
    data_points: int

class PostGISMigrator:
    def __init__(self, sqlite_path: str, postgres_url: str):
        self.sqlite_path = sqlite_path
        self.postgres_url = postgres_url
        self.tile_size = 0.01  # 0.01 degrees ≈ 1km at equator
        
    async def migrate(self):
        """Main migration process"""
        logger.info("Starting PostGIS migration...")
        
        # 1. Setup PostGIS database
        await self.setup_postgis()
        
        # 2. Read SQLite data and create tiles
        tiles = self.create_tiles_from_sqlite()
        
        # 3. Insert tiles into PostGIS
        await self.insert_tiles(tiles)
        
        logger.info("Migration complete!")
    
    async def setup_postgis(self):
        """Create PostGIS database schema"""
        conn = await asyncpg.connect(self.postgres_url)
        
        try:
            # Enable PostGIS extension
            await conn.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
            
            # Create main tiles table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS elevation_tiles (
                    tile_id VARCHAR(20) PRIMARY KEY,
                    zoom_level INTEGER NOT NULL,
                    x INTEGER NOT NULL,
                    y INTEGER NOT NULL,
                    geom GEOMETRY(POLYGON, 4326) NOT NULL,
                    min_elevation REAL NOT NULL,
                    max_elevation REAL NOT NULL,
                    avg_elevation REAL NOT NULL,
                    data_points INTEGER NOT NULL,
                    elevation_data BYTEA NOT NULL,
                    source VARCHAR(50) DEFAULT 'scraped',
                    accuracy VARCHAR(20) DEFAULT 'medium',
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """)
            
            # Create spatial index
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS elevation_tiles_geom_idx 
                ON elevation_tiles USING GIST (geom);
            """)
            
            # Create other indexes
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS elevation_tiles_zoom_idx 
                ON elevation_tiles (zoom_level);
            """)
            
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS elevation_tiles_bounds_idx 
                ON elevation_tiles (min_elevation, max_elevation);
            """)
            
            # Create lookup function
            await conn.execute("""
                CREATE OR REPLACE FUNCTION get_elevation(lat REAL, lng REAL)
                RETURNS REAL AS $$
                DECLARE
                    tile_data BYTEA;
                    result REAL;
                BEGIN
                    -- Find tile containing the point
                    SELECT elevation_data INTO tile_data
                    FROM elevation_tiles 
                    WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(lng, lat), 4326))
                    ORDER BY zoom_level DESC
                    LIMIT 1;
                    
                    -- If no tile found, return NULL
                    IF tile_data IS NULL THEN
                        RETURN NULL;
                    END IF;
                    
                    -- Extract elevation from compressed tile data
                    -- (This would need custom implementation for your compression format)
                    -- For now, return average from tile bounds
                    SELECT avg_elevation INTO result
                    FROM elevation_tiles 
                    WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(lng, lat), 4326))
                    ORDER BY zoom_level DESC
                    LIMIT 1;
                    
                    RETURN result;
                END;
                $$ LANGUAGE plpgsql;
            """)
            
            logger.info("PostGIS schema created successfully")
            
        finally:
            await conn.close()
    
    def create_tiles_from_sqlite(self) -> List[TileData]:
        """Read SQLite data and organize into spatial tiles"""
        logger.info("Reading SQLite data and creating tiles...")
        
        tiles = {}
        
        with sqlite3.connect(self.sqlite_path) as conn:
            cursor = conn.execute("""
                SELECT lat, lng, elevation FROM elevation_data
                ORDER BY lat, lng
            """)
            
            point_count = 0
            for lat, lng, elevation in cursor:
                # Calculate tile coordinates
                tile_x = int(lng / self.tile_size)
                tile_y = int(lat / self.tile_size)
                tile_id = f"z1_x{tile_x}_y{tile_y}"
                
                # Initialize tile if doesn't exist
                if tile_id not in tiles:
                    min_lat = tile_y * self.tile_size
                    max_lat = (tile_y + 1) * self.tile_size
                    min_lng = tile_x * self.tile_size
                    max_lng = (tile_x + 1) * self.tile_size
                    
                    tiles[tile_id] = {
                        'tile_id': tile_id,
                        'zoom_level': 1,
                        'x': tile_x,
                        'y': tile_y,
                        'bounds': (min_lat, min_lng, max_lat, max_lng),
                        'points': [],
                        'elevations': []
                    }
                
                # Add point to tile
                tiles[tile_id]['points'].append((lat, lng))
                tiles[tile_id]['elevations'].append(elevation)
                
                point_count += 1
                if point_count % 10000 == 0:
                    logger.info(f"Processed {point_count:,} points...")
        
        logger.info(f"Created {len(tiles):,} tiles from {point_count:,} points")
        
        # Convert to TileData objects
        tile_objects = []
        for tile_data in tiles.values():
            if len(tile_data['elevations']) > 0:
                elevations = tile_data['elevations']
                
                tile_obj = TileData(
                    tile_id=tile_data['tile_id'],
                    zoom_level=tile_data['zoom_level'],
                    x=tile_data['x'],
                    y=tile_data['y'],
                    bounds=tile_data['bounds'],
                    elevation_grid=self._create_elevation_grid(tile_data['points'], elevations),
                    min_elevation=min(elevations),
                    max_elevation=max(elevations),
                    avg_elevation=sum(elevations) / len(elevations),
                    data_points=len(elevations)
                )
                
                tile_objects.append(tile_obj)
        
        return tile_objects
    
    def _create_elevation_grid(self, points: List[Tuple[float, float]], elevations: List[float]) -> List[List[float]]:
        """Create a regular grid from scattered elevation points"""
        # For now, create a simple 10x10 grid with interpolated values
        # In production, you'd want more sophisticated interpolation
        
        if not points:
            return [[0.0] * 10 for _ in range(10)]
        
        # Simple grid interpolation
        grid = []
        for i in range(10):
            row = []
            for j in range(10):
                # Find closest elevation point
                grid_lat = min(p[0] for p in points) + i * (max(p[0] for p in points) - min(p[0] for p in points)) / 9
                grid_lng = min(p[1] for p in points) + j * (max(p[1] for p in points) - min(p[1] for p in points)) / 9
                
                # Find closest actual point
                closest_idx = 0
                min_dist = float('inf')
                for idx, (lat, lng) in enumerate(points):
                    dist = (lat - grid_lat) ** 2 + (lng - grid_lng) ** 2
                    if dist < min_dist:
                        min_dist = dist
                        closest_idx = idx
                
                row.append(elevations[closest_idx])
            grid.append(row)
        
        return grid
    
    def _compress_elevation_grid(self, grid: List[List[float]]) -> bytes:
        """Compress elevation grid for storage"""
        # Convert to binary format
        binary_data = b''
        for row in grid:
            for elevation in row:
                binary_data += struct.pack('f', elevation)  # 4 bytes per float
        
        # Compress with gzip
        return gzip.compress(binary_data)
    
    async def insert_tiles(self, tiles: List[TileData]):
        """Insert tiles into PostGIS database"""
        logger.info(f"Inserting {len(tiles):,} tiles into PostGIS...")
        
        conn = await asyncpg.connect(self.postgres_url)
        
        try:
            for i, tile in enumerate(tiles):
                # Create WKT polygon for tile bounds
                min_lat, min_lng, max_lat, max_lng = tile.bounds
                polygon_wkt = f"POLYGON(({min_lng} {min_lat}, {max_lng} {min_lat}, {max_lng} {max_lat}, {min_lng} {max_lat}, {min_lng} {min_lat}))"
                
                # Compress elevation data
                compressed_data = self._compress_elevation_grid(tile.elevation_grid)
                
                # Insert tile
                await conn.execute("""
                    INSERT INTO elevation_tiles 
                    (tile_id, zoom_level, x, y, geom, min_elevation, max_elevation, 
                     avg_elevation, data_points, elevation_data)
                    VALUES ($1, $2, $3, $4, ST_GeomFromText($5, 4326), $6, $7, $8, $9, $10)
                    ON CONFLICT (tile_id) DO UPDATE SET
                        min_elevation = EXCLUDED.min_elevation,
                        max_elevation = EXCLUDED.max_elevation,
                        avg_elevation = EXCLUDED.avg_elevation,
                        data_points = EXCLUDED.data_points,
                        elevation_data = EXCLUDED.elevation_data,
                        updated_at = NOW()
                """, 
                    tile.tile_id,
                    tile.zoom_level,
                    tile.x,
                    tile.y,
                    polygon_wkt,
                    tile.min_elevation,
                    tile.max_elevation,
                    tile.avg_elevation,
                    tile.data_points,
                    compressed_data
                )
                
                if (i + 1) % 100 == 0:
                    logger.info(f"Inserted {i + 1:,}/{len(tiles):,} tiles...")
        
        finally:
            await conn.close()
        
        logger.info("All tiles inserted successfully!")

# Configuration
SQLITE_PATH = "elevation.db"
POSTGRES_URL = "postgresql://user:password@localhost:5432/baroudique_elevation"

async def main():
    """Run the migration"""
    migrator = PostGISMigrator(SQLITE_PATH, POSTGRES_URL)
    await migrator.migrate()

if __name__ == "__main__":
    asyncio.run(main())