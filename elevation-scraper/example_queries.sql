-- Example Queries for UK Elevation Database
-- Real-world examples of how you'll use this data

-- 1. Find the steepest climbs in the UK
SELECT 
    segment_id,
    road_type,
    max_gradient,
    total_ascent,
    length_meters,
    cycling_suitability_score
FROM road_elevation_profiles 
WHERE max_gradient > 10.0 
    AND total_ascent > 50
    AND length_meters > 500
ORDER BY max_gradient DESC
LIMIT 10;

-- Expected results:
-- Hardknott Pass: 33% max gradient
-- Winnats Pass: 20% max gradient  
-- Rosedale Chimney: 18% max gradient
-- etc.

-- 2. Find cycling-friendly routes in London (flat, good surface)
SELECT 
    segment_id,
    road_type,
    surface,
    max_gradient,
    cycling_suitability_score,
    length_meters
FROM road_elevation_profiles 
WHERE max_gradient < 3.0 
    AND cycling_suitability_score > 80
    AND surface IN ('asphalt', 'paved')
    AND road_type IN ('cycleway', 'residential', 'tertiary')
ORDER BY cycling_suitability_score DESC
LIMIT 20;

-- 3. Calculate elevation profile for a route (Box Hill climb)
-- This would be called by your FastAPI when generating route elevation
WITH route_segments AS (
    SELECT * FROM road_elevation_profiles 
    WHERE osm_way_id IN (4567890, 4567891, 4567892) -- Box Hill route
)
SELECT 
    segment_id,
    elevation_samples,
    total_ascent,
    max_gradient
FROM route_segments
ORDER BY segment_id;

-- 4. Find all cycling paths and dedicated bike infrastructure
SELECT 
    COUNT(*) as total_segments,
    SUM(length_meters) / 1000 as total_km,
    AVG(cycling_suitability_score) as avg_score
FROM road_elevation_profiles 
WHERE road_type = 'cycleway';

-- 5. Surface quality analysis
SELECT 
    surface,
    COUNT(*) as segments,
    SUM(length_meters) / 1000 as total_km,
    AVG(cycling_suitability_score) as avg_cycling_score
FROM road_elevation_profiles 
GROUP BY surface
ORDER BY avg_cycling_score DESC;

-- Expected results:
-- asphalt: 85.2 avg score
-- paved: 83.1 avg score
-- concrete: 78.5 avg score
-- gravel: 65.2 avg score

-- 6. Regional analysis - Peak District climbs
SELECT 
    segment_id,
    max_gradient,
    total_ascent,
    length_meters,
    cycling_suitability_score
FROM road_elevation_profiles 
WHERE max_gradient > 8.0 
    AND total_ascent > 100
    -- Would need to add region filtering based on coordinates
ORDER BY total_ascent DESC;

-- 7. Performance query - Get elevation for specific coordinate
-- This is what your FastAPI elevation endpoint will use
SELECT 
    segment_id,
    elevation_samples,
    min_elevation,
    max_elevation
FROM road_elevation_profiles 
WHERE json_extract(elevation_samples, '$[0].lat') <= 51.4308 + 0.001
    AND json_extract(elevation_samples, '$[0].lat') >= 51.4308 - 0.001
    AND json_extract(elevation_samples, '$[0].lng') <= -0.9101 + 0.001  
    AND json_extract(elevation_samples, '$[0].lng') >= -0.9101 - 0.001
LIMIT 1;