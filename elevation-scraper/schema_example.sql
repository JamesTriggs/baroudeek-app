-- Baroudique UK Elevation Database Schema
-- Single table storing road elevation profiles

CREATE TABLE road_elevation_profiles (
    -- Primary identifiers
    segment_id TEXT PRIMARY KEY,           -- e.g., "seg_12345_abc123"
    osm_way_id INTEGER,                    -- OpenStreetMap way ID
    
    -- Road characteristics
    road_type TEXT,                        -- 'cycleway', 'residential', 'primary', etc.
    surface TEXT,                          -- 'asphalt', 'concrete', 'gravel', etc.
    length_meters REAL,                    -- Total length of road segment
    
    -- Elevation summary statistics
    min_elevation REAL,                    -- Lowest point on road (meters)
    max_elevation REAL,                    -- Highest point on road (meters)
    total_ascent REAL,                     -- Total uphill climbing (meters)
    total_descent REAL,                    -- Total downhill (meters)
    
    -- Gradient analysis
    max_gradient REAL,                     -- Steepest gradient (percentage)
    avg_gradient REAL,                     -- Average gradient (percentage)
    
    -- Cycling-specific scoring
    cycling_suitability_score REAL,       -- 0-100 score for cycling
    
    -- Detailed elevation data
    elevation_samples TEXT,                -- JSON array of detailed elevation points
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX idx_osm_way_id ON road_elevation_profiles (osm_way_id);
CREATE INDEX idx_road_type ON road_elevation_profiles (road_type);
CREATE INDEX idx_gradient ON road_elevation_profiles (max_gradient);
CREATE INDEX idx_cycling_score ON road_elevation_profiles (cycling_suitability_score);

-- Example row data for Box Hill, Surrey (famous UK cycling climb):

INSERT INTO road_elevation_profiles VALUES (
    'seg_4567890_boxhill',                 -- segment_id
    4567890,                               -- osm_way_id
    'tertiary',                            -- road_type
    'asphalt',                             -- surface
    2400.0,                                -- length_meters (2.4km)
    56.0,                                  -- min_elevation (bottom of hill)
    171.0,                                 -- max_elevation (top of Box Hill)
    115.0,                                 -- total_ascent
    0.0,                                   -- total_descent (it's a climb!)
    8.9,                                   -- max_gradient (steepest section)
    4.8,                                   -- avg_gradient (overall climb)
    78.5,                                  -- cycling_suitability_score (good road)
    '[                                     -- elevation_samples (JSON)
        {
            "lat": 51.2398,
            "lng": -0.3284,
            "elevation": 56.0,
            "distance_along_road": 0.0,
            "gradient": 0.0,
            "local_max_gradient": 6.2
        },
        {
            "lat": 51.2401,
            "lng": -0.3287,
            "elevation": 58.5,
            "distance_along_road": 15.0,
            "gradient": 2.8,
            "local_max_gradient": 7.1
        },
        {
            "lat": 51.2405,
            "lng": -0.3291,
            "elevation": 63.2,
            "distance_along_road": 30.0,
            "gradient": 5.2,
            "local_max_gradient": 8.9
        }
    ]',
    '2025-07-19 20:45:00'                  -- created_at
);