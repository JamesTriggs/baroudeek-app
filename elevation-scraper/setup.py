#!/usr/bin/env python3
"""
Setup script for the Baroudique Elevation Scraper

Run this first to initialize the system and start scraping priority regions.
"""

import asyncio
import sqlite3
from elevation_scraper import ElevationDatabase, GridGenerator
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_database():
    """Initialize the elevation database and create priority grid"""
    logger.info("Setting up Baroudique Elevation Database...")
    
    # Initialize database
    db = ElevationDatabase()
    
    # Generate priority grid (focus on cycling regions first)
    logger.info("Generating priority grid for cycling regions...")
    GridGenerator.generate_world_grid(db, grid_size=0.01)
    
    # Show statistics
    with sqlite3.connect(db.db_path) as conn:
        cursor = conn.execute("SELECT COUNT(*) FROM scrape_progress WHERE priority = 1")
        priority1_count = cursor.fetchone()[0]
        
        cursor = conn.execute("SELECT COUNT(*) FROM scrape_progress WHERE priority = 2") 
        priority2_count = cursor.fetchone()[0]
        
        cursor = conn.execute("SELECT COUNT(*) FROM scrape_progress")
        total_count = cursor.fetchone()[0]
    
    logger.info(f"Database setup complete!")
    logger.info(f"Priority 1 regions (Europe, US, Australia): {priority1_count:,} grid cells")
    logger.info(f"Priority 2 regions (Canada, India, China, Japan): {priority2_count:,} grid cells") 
    logger.info(f"Total grid cells: {total_count:,}")
    logger.info(f"Estimated Priority 1 completion: {priority1_count * 0.5 / 3600:.1f} hours at 2 req/sec")
    
    print("\n" + "="*60)
    print("🎉 SETUP COMPLETE!")
    print("="*60)
    print(f"✅ Database created: elevation.db")
    print(f"✅ Grid generated: {total_count:,} cells worldwide")
    print(f"✅ Priority regions identified: {priority1_count:,} high-priority cells")
    print("\nNext steps:")
    print("1. Run: python elevation_scraper.py")
    print("2. Let it run continuously to build your elevation database")
    print("3. Monitor progress in elevation_scraper.log")
    print("4. Update your FastAPI backend to use the local database")
    print("\nThe scraper will prioritize cycling regions first!")
    print("="*60)

if __name__ == "__main__":
    setup_database()