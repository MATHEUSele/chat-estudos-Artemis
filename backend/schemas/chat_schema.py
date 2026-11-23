from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator, model_validator

ChatRole = Literal["system", "user", "assistant", "model"]
StreamEventType = Literal["text_chunk", "search_event", "error", "end"]


class ChatMessage(BaseModel):
    role: ChatRole = Field(..., description="Papel do autor da mensagem")
    content: str = Field(..., min_length=1, description="Conteúdo textual da mensagem")

    @field_validator("content")
    @classmethod
    def validate_non_blank_content(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("A mensagem não pode estar vazia.")
        return stripped


class ChatRequest(BaseModel):
    session_id: int = Field(default=1, ge=1, description="Identificador da sessão de chat")
    model: Optional[str] = Field(
        default=None,
        min_length=1,
        description="Modelo Ollama opcional; usa OLLAMA_MODEL quando omitido",
    )
    message: Optional[str] = Field(
        default=None,
        min_length=1,
        description="Mensagem única do usuário (atalho)",
    )
    messages: Optional[list[ChatMessage]] = Field(
        default=None,
        min_length=1,
        description="Histórico estruturado de mensagens da conversa",
    )

    @model_validator(mode="after")
    def normalize_messages(self) -> "ChatRequest":
        if self.message is not None:
            stripped_message = self.message.strip()
            if not stripped_message:
                raise ValueError("A mensagem não pode estar vazia.")
            self.message = stripped_message

        if not self.messages:
            if self.message is None:
                raise ValueError("Informe 'message' ou 'messages'.")
            self.messages = [ChatMessage(role="user", content=self.message)]

        if self.model is not None:
            stripped_model = self.model.strip()
            if not stripped_model:
                raise ValueError("O nome do modelo não pode estar vazio.")
            self.model = stripped_model

        return self

    @property
    def latest_user_message(self) -> ChatMessage:
        if self.messages:
            for msg in reversed(self.messages):
                if msg.role == "user":
                    return msg
            return self.messages[-1]
        return ChatMessage(role="user", content=self.message or "")


class ChatStreamEvent(BaseModel):
    type: StreamEventType = Field(..., description="Tipo do evento SSE emitido pelo backend")
    content: str = Field(default="", description="Conteúdo do chunk ou mensagem de erro")

    def to_sse(self) -> str:
        return f"data: {self.model_dump_json()}\n\n"


ChatMessageResponse = ChatStreamEvent
