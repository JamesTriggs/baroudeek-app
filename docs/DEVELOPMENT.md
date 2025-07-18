# Development Setup Guide

This guide will help you set up the CycleShare development environment on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.11 or higher) - [Download](https://python.org/)
- **Docker** and **Docker Compose** - [Download](https://docker.com/get-started)
- **Git** - [Download](https://git-scm.com/)

## Security Setup

⚠️ **Important**: Before running the application, create secure environment variables:

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with secure values
# - Change POSTGRES_PASSWORD to a strong password
# - Change JWT_SECRET to a secure random string
```

## Quick Start (Recommended)

The easiest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/JamesTriggs/cycleshare-app.git
cd cycleshare-app

# Start all services
docker-compose up -d

# Wait for services to be ready, then open your browser to:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

## Manual Setup

If you prefer to run services individually:

### 1. Database Setup

Start PostgreSQL with PostGIS:
```bash
docker-compose up -d postgres
```

The database will be available at `localhost:5432` with:
- Database: `cycleshare`
- Username: `postgres`
- Password: (set via environment variable)

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Environment Configuration

### Backend Environment Variables

Copy `backend/.env.example` to `backend/.env` and update:

```env
# Database
DATABASE_URL=postgresql://postgres:your_secure_password@localhost:5432/cycleshare

# Redis (for caching and sessions)
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-secret-key-here

# API Configuration
ALLOWED_ORIGINS=["http://localhost:3000"]
```

### Frontend Environment Variables

Copy `frontend/.env.example` to `frontend/.env` and update:

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# Map Configuration
VITE_DEFAULT_MAP_CENTER_LAT=51.505
VITE_DEFAULT_MAP_CENTER_LNG=-0.09
```

## Development Commands

### Frontend Commands

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

### Backend Commands

```bash
cd backend

# Start development server
uvicorn app.main:app --reload

# Run tests
pytest

# Format code
black .

# Type checking
mypy .
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild services
docker-compose build

# Start individual services
docker-compose up -d postgres redis
```

## Database Management

### Database Migrations

The application uses SQLAlchemy with Alembic for database migrations:

```bash
cd backend

# Generate migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Downgrade migration
alembic downgrade -1
```

### Database Seeding

To populate the database with sample data:

```bash
cd backend
python -c "from app.db.seed import seed_database; seed_database()"
```

## API Documentation

Once the backend is running, you can access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Testing

### Frontend Testing

```bash
cd frontend

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Backend Testing

```bash
cd backend

# Run tests
pytest

# Run tests with coverage
pytest --cov=app
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Check if other services are using ports 3000, 8000, 5432, or 6379
   - Use `lsof -i :PORT` to find processes using specific ports

2. **Database Connection Issues**
   - Ensure PostgreSQL is running: `docker-compose ps`
   - Check database logs: `docker-compose logs postgres`

3. **Frontend Build Issues**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Clear npm cache: `npm cache clean --force`

4. **Backend Import Issues**
   - Ensure virtual environment is activated
   - Reinstall dependencies: `pip install -r requirements.txt`

### Debug Mode

To enable debug mode:

**Backend:**
```bash
export ENVIRONMENT=development
uvicorn app.main:app --reload --log-level debug
```

**Frontend:**
```bash
export VITE_NODE_ENV=development
npm run dev
```

## Architecture Overview

```
cycleshare-app/
├── frontend/          # React TypeScript app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store
│   │   └── types/         # TypeScript types
│   └── public/        # Static assets
├── backend/           # FastAPI Python app
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── core/          # Core configuration
│   │   ├── db/            # Database models
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic
│   └── tests/         # Test files
└── docs/              # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test` and `pytest`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Phase 1 Progress Update

### ✅ Recently Completed

**Task 1: Real Routing API Integration** - COMPLETED
- ✅ OpenRouteService API integration with cycling-specific profiles
- ✅ Environment variable configuration for API keys
- ✅ Enhanced error handling and fallback routing
- ✅ Route information display (distance, duration, elevation)
- ✅ Waypoint management (add/remove functionality)
- ✅ Cycling-optimized routing (avoids highways, prefers quiet roads)

### 🔄 Current Features

1. **Interactive Route Planning**
   - Click on map to add waypoints
   - Generate cycling-optimized routes
   - View route statistics (distance, time, elevation)
   - Remove individual waypoints
   - Clear all waypoints

2. **Routing Intelligence**
   - OpenRouteService integration for real routing
   - Cycling-specific preferences (avoid highways, prefer quiet roads)
   - Elevation profile support
   - Graceful fallback to straight-line routing

3. **User Interface**
   - Material-UI components with responsive design
   - Real-time route updates
   - Loading states and error handling
   - Route details panel

4. **User Authentication**
   - User registration and login forms
   - JWT token-based authentication
   - Protected routes for authenticated users
   - Secure token storage and management
   - User profile display in navbar
   - Session management and logout functionality

**Task 2: User Authentication** - COMPLETED
- ✅ Login/Register UI components (LoginForm, RegisterForm, AuthDialog)
- ✅ Login and Register pages with routing
- ✅ JWT token management with secure storage
- ✅ Protected routes component and route protection
- ✅ Updated Navbar with authentication features
- ✅ Auth context for managing authentication state
- ✅ Token refresh and storage management utilities

### 🚀 Next Phase 1 Tasks

**Task 3: Route Saving** (Next)
- Save routes to database
- Route management interface
- User route history

### API Configuration

To get real routing (instead of straight-line fallback):
1. Sign up for free at https://openrouteservice.org/
2. Add your API key to `frontend/.env`:
   ```
   VITE_OPENROUTESERVICE_API_KEY=your-api-key-here
   ```

### Testing the Route Planner

1. Start the frontend: `cd frontend && npm run dev`
2. Open http://localhost:3000
3. Click on the map to add waypoints
4. Click "Generate Route" to see cycling-optimized routing
5. View route details in the sidebar
6. Test waypoint removal and clearing

### Testing Authentication

1. Start both backend and frontend:
   ```bash
   # Terminal 1 - Backend
   cd backend && uvicorn app.main:app --reload
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

2. Open http://localhost:3000

3. **Registration Test:**
   - Click "Sign Up" in the navbar
   - Fill in email, username, and password
   - Click "Create Account"
   - Should redirect to planner and show username in navbar

4. **Login Test:**
   - Click "Logout" from user menu
   - Click "Login" in navbar
   - Enter registered credentials
   - Should redirect to planner and show username in navbar

5. **Protected Routes Test:**
   - Visit /planner or /profile while logged out
   - Should redirect to login page
   - After login, should redirect back to intended page

6. **Token Persistence Test:**
   - Login and refresh the page
   - Should remain logged in
   - Token should persist across browser sessions

## Next Steps

- Check out the [Architecture documentation](ARCHITECTURE.md)
- Review the [API documentation](http://localhost:8000/docs) when running
- Explore the codebase starting with `frontend/src/App.tsx` and `backend/app/main.py`
- Set up your IDE with the recommended extensions for TypeScript and Python

Happy coding! 🚴‍♂️