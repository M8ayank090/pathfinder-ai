from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class MessageType(str, Enum):
    TEXT = "text"
    ROUTE = "route"
    SUGGESTION = "suggestion"
    ACHIEVEMENT = "achievement"


class MessageSender(str, Enum):
    USER = "user"
    AI = "ai"


class AIConversationBase(BaseModel):
    title: Optional[str] = None
    is_active: bool = True
    context_data: Optional[Dict[str, Any]] = None


class AIConversationCreate(AIConversationBase):
    user_id: int


class AIConversationUpdate(BaseModel):
    title: Optional[str] = None
    is_active: Optional[bool] = None
    context_data: Optional[Dict[str, Any]] = None


class AIConversation(AIConversationBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    messages: List["AIMessage"] = []

    class Config:
        from_attributes = True


class AIMessageBase(BaseModel):
    sender: MessageSender
    message_type: MessageType = MessageType.TEXT
    content: str = Field(..., min_length=1)
    metadata: Optional[Dict[str, Any]] = None


class AIMessageCreate(AIMessageBase):
    conversation_id: int


class AIMessage(AIMessageBase):
    id: int
    conversation_id: int
    tokens_used: Optional[int] = None
    processing_time: Optional[float] = None
    user_feedback: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_id: Optional[int] = None
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    message: AIMessage
    conversation_id: int
    suggestions: Optional[List[str]] = None
    quick_actions: Optional[List[Dict[str, Any]]] = None


class ConversationSummary(BaseModel):
    id: int
    title: Optional[str]
    message_count: int
    last_message_at: Optional[datetime]
    is_active: bool

    class Config:
        from_attributes = True


# Update forward references
AIConversation.model_rebuild() 