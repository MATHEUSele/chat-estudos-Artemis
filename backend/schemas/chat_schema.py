from pydantic import BaseModel, Field


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: int = Field(default=1, ge=1)


class ChatMessageResponse(BaseModel):
    type: str  # 'text_chunk', 'search_event', 'error', 'end'
    content: str
