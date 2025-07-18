# KOM-map - The Ultimate KOM Hunting Platform

A competitive cycling segment discovery and analysis platform designed for cyclists who chase KOMs (King of the Mountain) and QOMs (Queen of the Mountain).

## Features

- **KOM Segment Discovery**: AI-powered segment analysis to find the best KOM opportunities on any route
- **Crown Competition**: Track KOM attempts, compare times with rivals, and plan strategic attacks
- **Performance Analytics**: Detailed segment analysis, power requirements, and optimal conditions for KOM attempts
- **Mobile-First**: Responsive design optimized for on-the-go segment hunting
- **Real-time Updates**: Live KOM status tracking and competitor analysis

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
git clone git@github.com-personal:jamesjtriggs/cycleshare-app.git
cd cycleshare-app
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
kom-map/
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