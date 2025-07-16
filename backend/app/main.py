from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from app.api.routes import auth, routes, collaboration, community
from app.core.config import settings
from app.db.database import engine
from app.db.base import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CycleShare API",
    description="API for collaborative road cycling route planning",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Routes
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(routes.router, prefix="/routes", tags=["routes"])
app.include_router(collaboration.router, prefix="/collaboration", tags=["collaboration"])
app.include_router(community.router, prefix="/community", tags=["community"])

@app.get("/")
async def root():
    return {"message": "CycleShare API - Collaborative Route Planning for Cyclists"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)