import os
import json
from google import genai
from google.genai import types
from config import settings

# Inicializar o Client do Google GenAI
client = genai.Client(api_key=settings.GEMINI_API_KEY)

MODEL_ID = "gemini-2.5-flash"

async def stream_chat_response(prompt: str, interaction_id: str = None):
    """
    Função geradora que gerencia a comunicação com o Gemini usando a Interactions API.
    Ela processa tanto a geração de texto quanto as chamadas de ferramentas (Google Search).
    """
    
    # Configurar o modelo para permitir busca no Google
    config = types.GenerateContentConfig(
        tools=[{"google_search": {}}],
        temperature=0.7
    )
    
    try:
        # Iniciando a interação (streaming=True)
        response_stream = client.models.generate_content_stream(
            model=MODEL_ID,
            contents=prompt,
            config=config,
        )
        
        for chunk in response_stream:
            # Para cada chunk recebido, verificamos o que a IA está enviando.
            # Se for texto, envia o texto via yield
            if chunk.text:
                yield json.dumps({"type": "text_chunk", "content": chunk.text})
                
            # Na nova SDK, se uma tool call for invocada e automaticamente respondida,
            # os chunks refletirão o texto final, mas podemos monitorar se houve 
            # uso do google_search se inspecionarmos partes específicas (depende da versão).
            # Para manter simples e robusto, vamos passar os pedaços de texto pro cliente.
            
    except Exception as e:
        yield json.dumps({"type": "error", "content": f"Erro na IA: {str(e)}"})
    finally:
        yield json.dumps({"type": "end", "content": ""})

