from fastapi import APIRouter

from app.api.v1.endpoints import routes, ai, goals, users, dashboard, map

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(routes.router, prefix="/routes", tags=["routes"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(goals.router, prefix="/goals", tags=["goals"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(map.router, prefix="/map", tags=["map"]) 