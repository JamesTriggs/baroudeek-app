-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    user_id TEXT NOT NULL,
    geometry TEXT,
    distance REAL NOT NULL,
    estimated_time INTEGER NOT NULL,
    difficulty TEXT NOT NULL,
    road_quality_score REAL DEFAULT 0.0,
    safety_score REAL DEFAULT 0.0,
    elevation_data TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    tags TEXT DEFAULT '[]',
    view_count INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    rating_avg REAL DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    waypoints TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Create waypoints table (for future use with PostGIS)
CREATE TABLE IF NOT EXISTS waypoints (
    id TEXT PRIMARY KEY,
    route_id TEXT NOT NULL,
    address TEXT,
    name TEXT,
    type TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    elevation REAL,
    notes TEXT,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (route_id) REFERENCES routes (id) ON DELETE CASCADE
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_routes_user_id ON routes (user_id);
CREATE INDEX IF NOT EXISTS idx_routes_created_at ON routes (created_at);
CREATE INDEX IF NOT EXISTS idx_routes_public ON routes (is_public);
CREATE INDEX IF NOT EXISTS idx_waypoints_route_id ON waypoints (route_id);