-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create spatial indexes (will be created automatically by SQLAlchemy/GeoAlchemy2)
-- This file ensures PostGIS is available when the container starts