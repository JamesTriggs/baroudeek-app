# Baroudique Elevation Database Builder

A background Python system to build a comprehensive global elevation database for cycling route planning.

## Strategy

### Data Sources (Free & Legal)
1. **NASA SRTM** - 30m resolution global coverage
2. **USGS National Elevation Dataset** - High resolution for US
3. **European Environment Agency** - EU elevation data
4. **OpenTopography** - Academic access to LIDAR data

### Database Design
- **Grid-based storage** (0.001° = ~100m grid cells)
- **PostgreSQL with PostGIS** for spatial queries
- **Hierarchical storage** (country → region → grid)
- **Optimized for cycling routes** (smooth interpolation)

### Scraping Strategy
- **Rate-limited** (respect API limits)
- **Resumable** (checkpoint progress)
- **Prioritized** (populated areas first)
- **Efficient** (batch requests, smart caching)

## Implementation Plan

1. **Phase 1**: Core scraper + database setup
2. **Phase 2**: Priority region scraping (Europe, US, Australia)
3. **Phase 3**: Global coverage over months
4. **Phase 4**: Integration with FastAPI backend

## Storage Estimates
- **Global 30m resolution**: ~50GB compressed
- **Popular cycling regions**: ~5GB
- **Local cache**: Smart pre-loading based on user activity