from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from models.ollama_agent import stream_chat_response
from database import AsyncSessionLocal
from models.session_model import Message
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/ws/chat")
async def websocket_chat_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("Cliente conectado ao WebSocket de Chat.")
    
    try:
        while True:
            # Espera uma mensagem do cliente (pode ser texto simples ou audio base64)
            data = await websocket.receive_text()
            
            # Aqui no futuro podemos diferenciar áudio de texto.
            # Por enquanto assumimos que o Frontend enviou um texto.
            user_message = data
            
            # Salvar no banco em background (Async)
            async with AsyncSessionLocal() as db:
                new_msg = Message(role="user", content=user_message, session_id=1)
                db.add(new_msg)
                await db.commit()
            
            # Comunicar com a IA e repassar a resposta em tempo real
            full_ai_response = ""
            async for chunk in stream_chat_response(user_message):
                await websocket.send_text(chunk)
                
                # Se for um chunk de texto, montamos a resposta final para salvar no DB
                # (A montagem real dependeria de fazer um JSON parse no chunk, mas omitido para brevidade)
                # full_ai_response += text
                
    except WebSocketDisconnect:
        logger.info("Cliente desconectou do WebSocket.")
    except Exception as e:
        logger.error(f"Erro no WebSocket: {e}")
