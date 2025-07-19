#!/usr/bin/env python3
"""
Quick Start Script for UK Elevation Database

Gets you up and running with UK cycling data ASAP!
"""

import asyncio
import os
import sys
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('uk_elevation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def check_dependencies():
    """Check if all required packages are installed"""
    required_packages = ['overpy', 'geopy', 'shapely', 'aiohttp']
    missing = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing.append(package)
    
    if missing:
        logger.error(f"Missing required packages: {', '.join(missing)}")
        logger.info("Install them with: pip install " + " ".join(missing))
        return False
    
    return True

def estimate_completion_time():
    """Estimate how long the UK scraping will take"""
    
    # Priority 1 regions (major cycling areas)
    priority_1_roads = 25000 + 8000 + 3000 + 5000 + 4000 + 6000 + 4000 + 7000  # 62,000 roads
    
    # Estimate: 0.5 seconds per road (elevation API + processing)
    estimated_seconds = priority_1_roads * 0.5
    estimated_hours = estimated_seconds / 3600
    
    logger.info("🕐 ESTIMATED COMPLETION TIME:")
    logger.info(f"   Priority 1 regions: {priority_1_roads:,} roads")
    logger.info(f"   Time per road: ~0.5 seconds")
    logger.info(f"   Total time: ~{estimated_hours:.1f} hours")
    logger.info(f"   Overnight run: Perfect for {estimated_hours:.0f}-hour session")
    logger.info("")

async def test_apis():
    """Test that elevation APIs are working"""
    logger.info("🔍 Testing elevation APIs...")
    
    try:
        import aiohttp
        
        # Test with London coordinates
        test_location = {"latitude": 51.4308, "longitude": -0.9101}
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                'https://api.open-elevation.com/api/v1/lookup',
                json={'locations': [test_location]},
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    elevation = data['results'][0]['elevation']
                    logger.info(f"✅ Elevation API working! London test: {elevation}m")
                    return True
                else:
                    logger.error(f"❌ Elevation API error: {response.status}")
                    return False
                    
    except Exception as e:
        logger.error(f"❌ API test failed: {e}")
        return False

def show_uk_regions():
    """Show what UK regions will be covered"""
    regions = [
        ("Greater London", "Your local cycling network + commuter routes"),
        ("Cotswolds", "Classic English countryside cycling"), 
        ("New Forest", "Popular weekend cycling destination"),
        ("Peak District", "Challenging hill cycling"),
        ("Lake District", "Mountain cycling paradise"),
        ("Yorkshire Dales", "Tour de France routes"),
        ("Surrey Hills", "London cycling escape"),
        ("South Downs", "Coastal cycling routes")
    ]
    
    logger.info("🇬🇧 UK REGIONS TO BE COVERED:")
    for name, description in regions:
        logger.info(f"   • {name}: {description}")
    logger.info("")

async def main():
    """Main startup process"""
    
    print("""
🇬🇧 BAROUDIQUE UK ELEVATION SCRAPER
====================================
Building the UK's most comprehensive cycling elevation database!
    """)
    
    # 1. Check dependencies
    logger.info("1️⃣ Checking dependencies...")
    if not check_dependencies():
        sys.exit(1)
    logger.info("✅ All dependencies installed")
    logger.info("")
    
    # 2. Test APIs
    logger.info("2️⃣ Testing elevation APIs...")
    if not await test_apis():
        logger.warning("⚠️ API test failed - you may hit rate limits")
    logger.info("")
    
    # 3. Show coverage
    logger.info("3️⃣ Coverage plan...")
    show_uk_regions()
    
    # 4. Estimate time
    logger.info("4️⃣ Time estimation...")
    estimate_completion_time()
    
    # 5. Confirm start
    logger.info("🚀 READY TO START!")
    logger.info("")
    logger.info("This will:")
    logger.info("   • Extract cyclable roads from OpenStreetMap")
    logger.info("   • Get elevation data for every 15m along each road")
    logger.info("   • Calculate gradients and cycling suitability scores")
    logger.info("   • Store everything in a local SQLite database")
    logger.info("")
    
    response = input("Ready to build your UK cycling elevation database? (y/N): ")
    
    if response.lower() in ['y', 'yes']:
        logger.info("🎯 Starting UK elevation scraping...")
        
        # Import and run the scraper
        from uk_elevation_scraper import UKElevationScraper
        scraper = UKElevationScraper()
        await scraper.scrape_uk_cycling_regions()
        
    else:
        logger.info("👋 Scraping cancelled. Run again when ready!")

if __name__ == "__main__":
    asyncio.run(main())