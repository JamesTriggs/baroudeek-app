# Baroudeek - The Ultimate Cycling Adventure Platform

A cycling route discovery and adventure platform designed for cyclists who seek new challenges and explore the roads less traveled.

## Features

- **Route Discovery**: AI-powered route analysis to find the best cycling adventures on any terrain
- **Adventure Sharing**: Share routes, compare experiences with fellow cyclists, and plan group rides
- **Performance Analytics**: Detailed route analysis, elevation profiles, and optimal conditions for cycling
- **Mobile-First**: Responsive design optimized for on-the-go route planning
- **Real-time Updates**: Live route sharing and cyclist tracking

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for fast development
- Leaflet.js for interactive maps
- Material-UI for consistent design
- Socket.io for real-time features

### Backend
- FastAPI (Python) for high-performance API
- PostgreSQL with PostGIS for spatial data
- Redis for caching and sessions
- WebSocket support for real-time collaboration

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker and Docker Compose
- PostgreSQL with PostGIS

### Development Setup

1. Clone the repository:
```bash
git clone git@github.com-personal:jamesjtriggs/baroudeek-app.git
cd baroudeek-app
```

2. Start the development environment:
```bash
docker-compose up -d
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
npm run dev
```

4. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Project Structure

```
baroudeek/
├── frontend/          # React TypeScript application
├── backend/           # FastAPI Python application
├── docs/             # Project documentation
├── docker-compose.yml # Local development environment
└── README.md         # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

MIT License - see LICENSE file for details