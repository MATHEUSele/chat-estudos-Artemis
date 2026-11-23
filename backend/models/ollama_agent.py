import json
from typing import Optional
import httpx
from config import settings
from schemas.chat_schema import ChatStreamEvent


async def stream_chat_response(
    prompt: str,
    interaction_id: Optional[str] = None,
    model: Optional[str] = None,
):
    """
    Função geradora que se comunica com o Ollama (rodando no host)
    e faz streaming da resposta chunk a chunk para o endpoint SSE.
    """
    url = f"{settings.OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": model or settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": True,
    }

    try:
        timeout = httpx.Timeout(connect=10.0, read=120.0, write=10.0, pool=10.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream("POST", url, json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.strip():
                        data = json.loads(line)
                        if data.get("response"):
                            yield ChatStreamEvent(
                                type="text_chunk", content=data["response"]
                            ).model_dump_json()
                        if data.get("done"):
                            break
    except httpx.ConnectError:
        yield ChatStreamEvent(
            type="error",
            content=(
                f"Não foi possível conectar ao Ollama em {settings.OLLAMA_BASE_URL}. "
                "Verifique se o Ollama está rodando e configurado com OLLAMA_HOST=0.0.0.0:11434."
            ),
        ).model_dump_json()
    except Exception as e:
        yield ChatStreamEvent(
            type="error", content=f"Erro no Ollama: {str(e)}"
        ).model_dump_json()
    finally:
        yield ChatStreamEvent(type="end", content="").model_dump_json()
