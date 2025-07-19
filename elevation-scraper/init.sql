-- Initialize Baroudique Elevation Database
-- This script runs when PostGIS container starts

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Create elevation user with appropriate permissions
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'elevation_service') THEN
        CREATE USER elevation_service WITH PASSWORD 'elevation_service_password';
    END IF;
END
$$;

-- Grant permissions
GRANT CONNECT ON DATABASE baroudique_elevation TO elevation_service;
GRANT USAGE ON SCHEMA public TO elevation_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO elevation_service;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO elevation_service;

-- Create optimized settings for spatial data
ALTER DATABASE baroudique_elevation SET random_page_cost = 1.1;
ALTER DATABASE baroudique_elevation SET seq_page_cost = 1.0;

-- Set up initial spatial reference system info if needed
-- (PostGIS usually includes this, but just to be sure)
INSERT INTO spatial_ref_sys (srid, auth_name, auth_srid, proj4text, srtext) 
SELECT 4326, 'EPSG', 4326, 
       '+proj=longlat +datum=WGS84 +no_defs', 
       'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]]'
WHERE NOT EXISTS (SELECT 1 FROM spatial_ref_sys WHERE srid = 4326);

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Baroudique Elevation Database initialized successfully!';
    RAISE NOTICE 'PostGIS version: %', postgis_version();
    RAISE NOTICE 'PostgreSQL version: %', version();
END
$$;