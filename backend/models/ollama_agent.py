import httpx
import json
from config import settings

async def stream_chat_response(prompt: str, interaction_id: str = None):
    """
    Função geradora que se comunica com o Ollama (rodando no host)
    e faz streaming da resposta chunk a chunk via WebSocket.
    """
    url = f"{settings.OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": True,
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", url, json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.strip():
                        data = json.loads(line)
                        if data.get("response"):
                            yield json.dumps({"type": "text_chunk", "content": data["response"]})
                        if data.get("done"):
                            break
    except httpx.ConnectError:
        yield json.dumps({
            "type": "error",
            "content": f"Não foi possível conectar ao Ollama em {settings.OLLAMA_BASE_URL}. "
                       f"Verifique se o Ollama está rodando e configurado com OLLAMA_HOST=0.0.0.0:11434."
        })
    except Exception as e:
        yield json.dumps({"type": "error", "content": f"Erro no Ollama: {str(e)}"})
    finally:
        yield json.dumps({"type": "end", "content": ""})
