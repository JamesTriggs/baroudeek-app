from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from app.db.database import get_db
from app.schemas.route_simple import RouteCreateSimple, RouteUpdateSimple, RouteResponseSimple
from app.core.security import verify_token
# from app.api.routes.auth_simple import get_current_user_dependency  # Not needed
import uuid
import json

router = APIRouter()
security = HTTPBearer()

@router.post("/", response_model=RouteResponseSimple)
async def create_route(
    route_data: RouteCreateSimple,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Get current user
    token_data = verify_token(credentials.credentials)
    
    # Get user by email using raw SQL
    user = db.execute(text("""
        SELECT id FROM users WHERE email = :email
    """), {"email": token_data["sub"]}).fetchone()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Create route
    route_id = str(uuid.uuid4())
    
    try:
        db.execute(text("""
            INSERT INTO routes (
                id, user_id, name, description, distance, estimated_time, 
                difficulty, road_quality_score, safety_score, is_public, tags,
                view_count, usage_count, rating_avg, rating_count, waypoints,
                geometry, created_at
            ) VALUES (
                :id, :user_id, :name, :description, :distance, :estimated_time,
                :difficulty, :road_quality_score, :safety_score, :is_public, :tags,
                :view_count, :usage_count, :rating_avg, :rating_count, :waypoints,
                :geometry, NOW()
            )
        """), {
            "id": route_id,
            "user_id": user.id,
            "name": route_data.name,
            "description": route_data.description,
            "distance": route_data.distance,
            "estimated_time": route_data.estimated_time,
            "difficulty": route_data.difficulty,
            "road_quality_score": 0.0,
            "safety_score": 0.0,
            "is_public": route_data.is_public,
            "tags": '[]',
            "view_count": 0,
            "usage_count": 0,
            "rating_avg": 0.0,
            "rating_count": 0,
            "waypoints": json.dumps([wp.dict() for wp in route_data.waypoints]),
            "geometry": route_data.geometry
        })
        db.commit()
        
        print(f"Route created successfully with ID: {route_id}")
        
        # Return the created route
        return RouteResponseSimple(
            id=route_id,
            user_id=user.id,
            name=route_data.name,
            description=route_data.description,
            waypoints=route_data.waypoints,
            distance=route_data.distance,
            estimated_time=route_data.estimated_time,
            difficulty=route_data.difficulty,
            road_quality_score=0.0,
            safety_score=0.0,
            is_public=route_data.is_public,
            tags=[],
            view_count=0,
            usage_count=0,
            rating_avg=0.0,
            rating_count=0,
            created_at=None,  # Will be set properly later
            geometry=route_data.geometry
        )
        
    except Exception as e:
        print(f"Error creating route: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating route"
        )

@router.get("/", response_model=List[RouteResponseSimple])
async def get_user_routes(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Get current user
    token_data = verify_token(credentials.credentials)
    
    # Get user by email
    user = db.execute(text("""
        SELECT id FROM users WHERE email = :email
    """), {"email": token_data["sub"]}).fetchone()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get user's routes
    routes = db.execute(text("""
        SELECT id, user_id, name, description, distance, estimated_time, difficulty,
               road_quality_score, safety_score, is_public, tags, view_count,
               usage_count, rating_avg, rating_count, waypoints, geometry, created_at
        FROM routes 
        WHERE user_id = :user_id
        ORDER BY created_at DESC
    """), {"user_id": user.id}).fetchall()
    
    result = []
    for route in routes:
        try:
            waypoints_data = json.loads(route.waypoints) if route.waypoints else []
            tags_data = json.loads(route.tags) if route.tags else []
            
            result.append(RouteResponseSimple(
                id=route.id,
                user_id=route.user_id,
                name=route.name,
                description=route.description,
                waypoints=waypoints_data,
                distance=route.distance,
                estimated_time=route.estimated_time,
                difficulty=route.difficulty,
                road_quality_score=route.road_quality_score,
                safety_score=route.safety_score,
                is_public=route.is_public,
                tags=tags_data,
                view_count=route.view_count,
                usage_count=route.usage_count,
                rating_avg=route.rating_avg,
                rating_count=route.rating_count,
                created_at=route.created_at,
                geometry=route.geometry
            ))
        except Exception as e:
            print(f"Error parsing route {route.id}: {e}")
            continue
    
    return result

@router.get("/{route_id}", response_model=RouteResponseSimple)
async def get_route(
    route_id: str,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Get route
    route = db.execute(text("""
        SELECT id, user_id, name, description, distance, estimated_time, difficulty,
               road_quality_score, safety_score, is_public, tags, view_count,
               usage_count, rating_avg, rating_count, waypoints, geometry, created_at
        FROM routes 
        WHERE id = :route_id
    """), {"route_id": route_id}).fetchone()
    
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    try:
        waypoints_data = json.loads(route.waypoints) if route.waypoints else []
        tags_data = json.loads(route.tags) if route.tags else []
        
        return RouteResponseSimple(
            id=route.id,
            user_id=route.user_id,
            name=route.name,
            description=route.description,
            waypoints=waypoints_data,
            distance=route.distance,
            estimated_time=route.estimated_time,
            difficulty=route.difficulty,
            road_quality_score=route.road_quality_score,
            safety_score=route.safety_score,
            is_public=route.is_public,
            tags=tags_data,
            view_count=route.view_count,
            usage_count=route.usage_count,
            rating_avg=route.rating_avg,
            rating_count=route.rating_count,
            created_at=route.created_at,
            geometry=route.geometry
        )
    except Exception as e:
        print(f"Error parsing route {route.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error parsing route data"
        )

@router.put("/{route_id}", response_model=RouteResponseSimple)
async def update_route(
    route_id: str,
    route_update: RouteUpdateSimple,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Get current user
    token_data = verify_token(credentials.credentials)
    
    # Get user by email
    user = db.execute(text("""
        SELECT id FROM users WHERE email = :email
    """), {"email": token_data["sub"]}).fetchone()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if route exists and belongs to user
    route = db.execute(text("""
        SELECT id FROM routes WHERE id = :route_id AND user_id = :user_id
    """), {"route_id": route_id, "user_id": user.id}).fetchone()
    
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found or you don't have permission to edit it"
        )
    
    # Build update query dynamically
    update_fields = []
    update_values = {"route_id": route_id}
    
    if route_update.name is not None:
        update_fields.append("name = :name")
        update_values["name"] = route_update.name
    
    if route_update.description is not None:
        update_fields.append("description = :description")
        update_values["description"] = route_update.description
        
    if route_update.is_public is not None:
        update_fields.append("is_public = :is_public")
        update_values["is_public"] = route_update.is_public
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    update_fields.append("updated_at = NOW()")
    
    try:
        db.execute(text(f"""
            UPDATE routes 
            SET {', '.join(update_fields)}
            WHERE id = :route_id
        """), update_values)
        db.commit()
        
        # Return updated route
        return await get_route(route_id, db, credentials)
        
    except Exception as e:
        print(f"Error updating route: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating route"
        )

@router.delete("/{route_id}")
async def delete_route(
    route_id: str,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Get current user
    token_data = verify_token(credentials.credentials)
    
    # Get user by email
    user = db.execute(text("""
        SELECT id FROM users WHERE email = :email
    """), {"email": token_data["sub"]}).fetchone()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if route exists and belongs to user
    route = db.execute(text("""
        SELECT id FROM routes WHERE id = :route_id AND user_id = :user_id
    """), {"route_id": route_id, "user_id": user.id}).fetchone()
    
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found or you don't have permission to delete it"
        )
    
    try:
        db.execute(text("""
            DELETE FROM routes WHERE id = :route_id
        """), {"route_id": route_id})
        db.commit()
        
        return {"message": "Route deleted successfully"}
        
    except Exception as e:
        print(f"Error deleting route: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting route"
        )