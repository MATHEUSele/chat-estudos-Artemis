import { useState, useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import { toast } from 'sonner';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeout = useRef(null);
  const { addMessage, updateLastMessage, setThinking, setSearching } = useChatStore();

  const connect = useCallback(() => {
    // Determina o protocolo seguro (wss) ou inseguro (ws) dependendo do ambiente
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // O backend rodará na porta 8000 localmente. Se estiver no Github Pages, precisaremos
    // apontar para o domínio real do backend. Para desenvolvimento, usamos localhost.
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'localhost:8000';
    const wsUrl = `${protocol}//${backendUrl}/ws/chat`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      toast.success('Conectado à Artemis.');
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'text_chunk') {
          // A IA está digitando...
          updateLastMessage(data.content);
        } else if (data.type === 'search_event') {
          setSearching(true);
        } else if (data.type === 'end') {
          setThinking(false);
          setSearching(false);
        } else if (data.type === 'error') {
          updateLastMessage(`\n[Erro]: ${data.content}`);
          toast.error("Erro na comunicação com a IA");
          setThinking(false);
        }
      } catch (e) {
        // Fallback se não for JSON (ex: string pura enviada na prototipagem)
        updateLastMessage(event.data);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setThinking(false);
      // Lógica de reconexão automática com Exponential Backoff (simplificado)
      toast.error('Conexão perdida. Tentando reconectar...');
      reconnectTimeout.current = setTimeout(() => {
        connect();
      }, 3000);
    };
    
    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [addMessage, updateLastMessage, setThinking, setSearching]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [connect]);

  const sendMessage = (text) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      addMessage({ role: 'user', content: text });
      setThinking(true);
      addMessage({ role: 'model', content: '' }); // Prepara a bolha vazia para o streaming
      wsRef.current.send(text);
    } else {
      toast.error('Não foi possível enviar a mensagem. Sem conexão.');
    }
  };

  return { isConnected, sendMessage };
}
