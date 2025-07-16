from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.route import RouteCreate, RouteUpdate, RouteResponse, RouteGenerate
from app.models.route import Route
from app.models.waypoint import Waypoint
from app.models.user import User
from app.api.routes.auth import get_current_user_dependency
from app.services.route_service import RouteService

router = APIRouter()

@router.get("/", response_model=List[RouteResponse])
async def get_routes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    routes = db.query(Route).filter(Route.is_public == True).offset(skip).limit(limit).all()
    return routes

@router.get("/{route_id}", response_model=RouteResponse)
async def get_route(
    route_id: str,
    db: Session = Depends(get_db)
):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    # Increment view count
    route.view_count += 1
    db.commit()
    
    return route

@router.post("/", response_model=RouteResponse)
async def create_route(
    route_data: RouteCreate,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    # Create route
    db_route = Route(
        name=route_data.name,
        description=route_data.description,
        user_id=current_user.id,
        is_public=route_data.is_public,
        tags=route_data.tags,
        distance=0.0,  # Will be calculated
        estimated_time=0,  # Will be calculated
        difficulty="moderate",  # Will be calculated
        road_quality_score=0.0,  # Will be calculated
        safety_score=0.0  # Will be calculated
    )
    
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    
    # Create waypoints
    for waypoint_data in route_data.waypoints:
        db_waypoint = Waypoint(
            route_id=db_route.id,
            point=f"POINT({waypoint_data.lng} {waypoint_data.lat})",
            address=waypoint_data.address,
            name=waypoint_data.name,
            type=waypoint_data.type,
            order=waypoint_data.order,
            elevation=waypoint_data.elevation,
            notes=waypoint_data.notes
        )
        db.add(db_waypoint)
    
    db.commit()
    
    # Calculate route metrics
    route_service = RouteService(db)
    updated_route = await route_service.calculate_route_metrics(db_route.id)
    
    # Update user stats
    current_user.total_routes += 1
    db.commit()
    
    return updated_route

@router.put("/{route_id}", response_model=RouteResponse)
async def update_route(
    route_id: str,
    route_data: RouteUpdate,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    if route.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this route"
        )
    
    # Update route fields
    update_data = route_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(route, field, value)
    
    db.commit()
    db.refresh(route)
    
    return route

@router.delete("/{route_id}")
async def delete_route(
    route_id: str,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    if route.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this route"
        )
    
    db.delete(route)
    current_user.total_routes -= 1
    db.commit()
    
    return {"message": "Route deleted successfully"}

@router.post("/generate", response_model=RouteResponse)
async def generate_route(
    route_data: RouteGenerate,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    route_service = RouteService(db)
    generated_route = await route_service.generate_optimized_route(
        waypoints=route_data.waypoints,
        preferences=route_data.preferences,
        user_id=current_user.id
    )
    
    return generated_route

@router.get("/user/{user_id}", response_model=List[RouteResponse])
async def get_user_routes(
    user_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    routes = db.query(Route).filter(
        Route.user_id == user_id,
        Route.is_public == True
    ).offset(skip).limit(limit).all()
    
    return routes

@router.get("/user/me/routes", response_model=List[RouteResponse])
async def get_my_routes(
    current_user: User = Depends(get_current_user_dependency),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    routes = db.query(Route).filter(
        Route.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return routes