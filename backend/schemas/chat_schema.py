from pydantic import BaseModel
from typing import Optional

class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[int] = None

class ChatMessageResponse(BaseModel):
    type: str # 'text_chunk', 'search_event', 'end'
    content: str
