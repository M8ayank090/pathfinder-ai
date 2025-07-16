from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON, Enum, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class MessageType(str, enum.Enum):
    TEXT = "text"
    ROUTE = "route"
    SUGGESTION = "suggestion"
    ACHIEVEMENT = "achievement"


class MessageSender(str, enum.Enum):
    USER = "user"
    AI = "ai"


class AIConversation(Base):
    __tablename__ = "ai_conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=True)  # Auto-generated from first message
    is_active = Column(Boolean, default=True)
    
    # Context
    context_data = Column(JSON, nullable=True)  # User context, preferences, etc.
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    messages = relationship("AIMessage", back_populates="conversation")


class AIMessage(Base):
    __tablename__ = "ai_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("ai_conversations.id"), nullable=False)
    sender = Column(Enum(MessageSender), nullable=False)
    message_type = Column(Enum(MessageType), default=MessageType.TEXT)
    content = Column(Text, nullable=False)
    
    # Message metadata
    message_metadata = Column(JSON, nullable=True)  # Route data, suggestions, etc.
    tokens_used = Column(Integer, nullable=True)  # For AI messages
    processing_time = Column(Float, nullable=True)  # Response time in seconds
    
    # User interaction
    user_feedback = Column(JSON, nullable=True)  # Rating, helpfulness, etc.
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    conversation = relationship("AIConversation", back_populates="messages") 