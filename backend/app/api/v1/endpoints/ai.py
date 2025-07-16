from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from datetime import datetime
import json
import os
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.ai_chat import AIConversation, AIMessage, MessageType, MessageSender
from app.schemas.ai_chat import (
    ChatRequest, ChatResponse, AIConversation as AIConversationSchema,
    AIMessage as AIMessageSchema, ConversationSummary
)
from pydantic import BaseModel

router = APIRouter()


class FeedbackSchema(BaseModel):
    rating: int = 0
    helpful: bool = False
    comment: str = ""
    extra: dict = {}


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Chat with AI assistant"""
    # Get or create conversation
    conversation_id = chat_request.conversation_id
    if not conversation_id:
        # Create new conversation
        conversation = AIConversation(
            user_id=current_user.id,
            title=chat_request.message[:50] + "..." if len(chat_request.message) > 50 else chat_request.message,
            context_data=chat_request.context
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)
        conversation_id = conversation.id
    
    # Save user message
    user_message = AIMessage(
        conversation_id=int(conversation_id) if conversation_id is not None else 0,
        sender=MessageSender.USER,
        content=chat_request.message,
        message_metadata=chat_request.context or {}
    )
    db.add(user_message)
    
    # Generate AI response (mock for now)
    # TODO: Integrate with real AI model or API here
    ai_response_content = generate_ai_response(chat_request.message, current_user)
    
    # Save AI message
    ai_message = AIMessage(
        conversation_id=int(conversation_id) if conversation_id is not None else 0,
        sender=MessageSender.AI,
        content=ai_response_content,
        message_type=MessageType.TEXT,
        tokens_used=len(ai_response_content.split()),  # Simple token estimation
        processing_time=0.5  # Mock processing time
    )
    db.add(ai_message)
    
    await db.commit()
    await db.refresh(ai_message)
    
    # Generate suggestions and quick actions
    suggestions = generate_suggestions(chat_request.message)
    quick_actions = generate_quick_actions(chat_request.message)
    
    return ChatResponse(
        message=ai_message,
        conversation_id=conversation_id,
        suggestions=suggestions,
        quick_actions=quick_actions
    )


@router.get("/conversations", response_model=List[ConversationSummary])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 20,
    offset: int = 0
):
    """Get user's conversation history"""
    result = await db.execute(
        select(AIConversation)
        .where(AIConversation.user_id == current_user.id)
        .order_by(AIConversation.updated_at.desc())
        .limit(limit)
        .offset(offset)
    )
    conversations = result.scalars().all()
    
    summaries = []
    for conv in conversations:
        # Get message count
        msg_count_result = await db.execute(
            select(func.count(AIMessage.id)).where(AIMessage.conversation_id == conv.id)
        )
        message_count = msg_count_result.scalar() or 0
        
        # Get last message time
        last_msg_result = await db.execute(
            select(AIMessage.created_at)
            .where(AIMessage.conversation_id == conv.id)
            .order_by(AIMessage.created_at.desc())
            .limit(1)
        )
        last_message_at = last_msg_result.scalar()
        
        summaries.append(ConversationSummary(
            id=conv.id,  # type: ignore
            title=conv.title,  # type: ignore
            message_count=message_count,
            last_message_at=last_message_at,
            is_active=conv.is_active  # type: ignore
        ))
    
    return summaries


@router.get("/conversations/{conversation_id}", response_model=AIConversationSchema)
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific conversation with all messages"""
    result = await db.execute(
        select(AIConversation).where(
            AIConversation.id == conversation_id,
            AIConversation.user_id == current_user.id
        )
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    return conversation


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a conversation"""
    result = await db.execute(
        select(AIConversation).where(
            AIConversation.id == conversation_id,
            AIConversation.user_id == current_user.id
        )
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Delete all messages using ORM
    messages_result = await db.execute(select(AIMessage).where(AIMessage.conversation_id == conversation_id))
    messages = messages_result.scalars().all()
    for msg in messages:
        await db.delete(msg)
    
    # Delete conversation
    await db.delete(conversation)
    await db.commit()
    
    return {"message": "Conversation deleted successfully"}


@router.post("/conversations/{conversation_id}/feedback")
async def provide_feedback(
    conversation_id: int,
    message_id: int,
    feedback: FeedbackSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Provide feedback on an AI message"""
    result = await db.execute(
        select(AIMessage).where(
            AIMessage.id == message_id,
            AIMessage.conversation_id == conversation_id
        )
    )
    message = result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    message.user_feedback = feedback.dict(exclude_unset=True)  # type: ignore
    await db.commit()
    
    return {"message": "Feedback recorded successfully"}


# Helper functions for AI responses
def generate_ai_response(user_message: str, user: User) -> str:
    """Generate AI response based on user message"""
    message_lower = user_message.lower()
    
    if "route" in message_lower or "directions" in message_lower:
        return "I can help you find the best route! What's your destination? I'll consider your preferences for scenic routes and safety."
    
    elif "goal" in message_lower or "progress" in message_lower:
        return "Great! I can help you track your goals. Would you like to see your current progress or set a new goal?"
    
    elif "weather" in message_lower:
        return "I can check the weather for your route. This will help ensure you have the best experience on your journey."
    
    elif "safety" in message_lower or "secure" in message_lower:
        return "Safety is my top priority! I'll always recommend the safest routes and provide real-time safety updates."
    
    elif "wellness" in message_lower or "health" in message_lower:
        return "I'm here to support your wellness journey! I can suggest routes that promote physical activity and mental well-being."
    
    else:
        return "Hello! I'm your AI navigation assistant. I can help you with routes, goals, weather updates, and wellness tips. What would you like to know?"


def generate_suggestions(user_message: str) -> List[str]:
    """Generate follow-up suggestions based on user message"""
    message_lower = user_message.lower()
    
    if "route" in message_lower:
        return [
            "Find scenic route to destination",
            "Check weather for my route",
            "Show me the safest path"
        ]
    
    elif "goal" in message_lower:
        return [
            "View my goal progress",
            "Set a new fitness goal",
            "Track my wellness score"
        ]
    
    elif "weather" in message_lower:
        return [
            "Check current weather",
            "Get weather forecast",
            "Find weather-safe routes"
        ]
    
    else:
        return [
            "Find a route",
            "Set a goal",
            "Check weather"
        ]


def generate_quick_actions(user_message: str) -> List[dict]:
    """Generate quick action buttons based on user message"""
    message_lower = user_message.lower()
    
    if "route" in message_lower:
        return [
            {"label": "Find Route", "action": "find_route", "icon": "map"},
            {"label": "Recent Routes", "action": "recent_routes", "icon": "history"},
            {"label": "Favorites", "action": "favorites", "icon": "star"}
        ]
    
    elif "goal" in message_lower:
        return [
            {"label": "View Goals", "action": "view_goals", "icon": "target"},
            {"label": "Add Goal", "action": "add_goal", "icon": "plus"},
            {"label": "Progress", "action": "progress", "icon": "trending-up"}
        ]
    
    else:
        return [
            {"label": "Quick Route", "action": "quick_route", "icon": "navigation"},
            {"label": "Goals", "action": "goals", "icon": "target"},
            {"label": "Weather", "action": "weather", "icon": "cloud"}
        ]


# Mock data endpoint for development
@router.get("/mock", response_model=List[dict])
async def get_mock_conversations():
    if os.environ.get("ENABLE_MOCK_ENDPOINTS", "true").lower() != "true":
        raise HTTPException(status_code=404, detail="Mock endpoints are disabled in this environment.")
    return [
        {
            "id": 1,
            "title": "Route Planning",
            "message_count": 8,
            "last_message_at": "2024-01-10T14:30:00Z",
            "is_active": True
        },
        {
            "id": 2,
            "title": "Goal Setting",
            "message_count": 12,
            "last_message_at": "2024-01-09T16:45:00Z",
            "is_active": False
        }
    ] 