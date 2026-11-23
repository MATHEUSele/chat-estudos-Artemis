import { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import { toast } from 'sonner';

function resolveBackendBaseUrl() {
  const rawBackendUrl = import.meta.env.VITE_BACKEND_URL;
  if (!rawBackendUrl) return '';
  if (rawBackendUrl.startsWith('http://') || rawBackendUrl.startsWith('https://')) {
    return rawBackendUrl.replace(/\/$/, '');
  }
  return `${window.location.protocol}//${rawBackendUrl.replace(/\/$/, '')}`;
}

export function useChatStream() {
  const eventSourceRef = useRef(null);
  const { addMessage, updateLastMessage, setThinking, setSearching } = useChatStore();

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setThinking(false);
    setSearching(false);
  }, [setThinking, setSearching]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const sendMessage = useCallback(
    (text, sessionId = 1) => {
      const trimmed = text?.trim();
      if (!trimmed) return;

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      addMessage({ role: 'user', content: trimmed });
      setThinking(true);
      addMessage({ role: 'model', content: '' });

      const baseUrl = resolveBackendBaseUrl();
      const params = new URLSearchParams({
        message: trimmed,
        session_id: String(sessionId),
      });

      const es = new EventSource(`${baseUrl}/api/chat/stream?${params.toString()}`);
      eventSourceRef.current = es;
      let finished = false;

      const closeStream = () => {
        finished = true;
        es.close();
        if (eventSourceRef.current === es) {
          eventSourceRef.current = null;
        }
        setThinking(false);
        setSearching(false);
      };

      es.onmessage = (event) => {
        if (event.data === '[DONE]') {
          closeStream();
          return;
        }

        try {
          const data = JSON.parse(event.data);

          if (data.type === 'text_chunk') {
            updateLastMessage(data.content);
          } else if (data.type === 'search_event') {
            setSearching(true);
          } else if (data.type === 'error') {
            updateLastMessage(`\n[Erro]: ${data.content}`);
            toast.error('Erro na comunicação com a IA');
            closeStream();
          } else if (data.type === 'end') {
            closeStream();
          }
        } catch {
          updateLastMessage(event.data);
        }
      };

      es.onerror = () => {
        es.close();
        if (eventSourceRef.current === es) {
          eventSourceRef.current = null;
        }
        if (!finished) {
          setThinking(false);
          setSearching(false);
          toast.error('Erro na conexão com a Artemis.');
        }
      };
    },
    [addMessage, updateLastMessage, setThinking, setSearching]
  );

  return { sendMessage, stopStream };
}
