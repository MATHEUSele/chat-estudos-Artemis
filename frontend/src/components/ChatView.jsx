import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { Mic, Send, Bot, User, Search, Square } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatView() {
  const { messages, addMessage, updateLastMessage, isRecording, isThinking, isSearching, setRecording, setThinking, setSearching } = useChatStore();
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);
  
  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const { isConnected, sendMessage } = useWebSocket();
  const handleAudioReady = (audioBlob) => {
    // Para simplificar no portfólio, enviaremos áudio futuro em Base64
    // Para agora, o chat usa o sendMessage de texto
    toast.success("Áudio processado (Integração na Fase 5)");
  };
  const { isRecording: isMicActive, toggleRecording: handleMicToggle } = useAudioRecorder(handleAudioReady);

  const handleSendText = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    // Send via WebSocket real
    sendMessage(inputText);
    setInputText('');
  };

  const toggleRecording = () => {
    handleMicToggle();
  };

  return (
    <div className="flex flex-col h-screen bg-artemis-dark text-white relative">
      {/* Header */}
      <header className="p-4 border-b border-white/10 bg-artemis-panel backdrop-blur-lg flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-artemis-primary" />
          <h1 className="font-semibold text-lg tracking-wide">Artemis</h1>
        </div>
        <div className="flex gap-2">
          {/* Status indicators */}
          <AnimatePresence>
            {isSearching && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 text-xs bg-artemis-secondary/20 text-artemis-secondary px-3 py-1 rounded-full"
              >
                <Search className="w-3 h-3 animate-pulse" />
                Pesquisando...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
        {messages.length === 0 && !isThinking && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
            <Bot className="w-16 h-16 mb-4" />
            <p>Como posso te ajudar hoje?</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-white/10' : 'bg-artemis-primary/20 text-artemis-primary'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-white/10 rounded-tr-sm' : 'bg-artemis-panel border border-white/5 backdrop-blur-sm rounded-tl-sm'}`}>
                  <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-base text-gray-100">
                    {msg.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          
          {isThinking && !isSearching && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 max-w-[70%]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-artemis-primary/20 text-artemis-primary">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-artemis-panel border border-white/5 backdrop-blur-sm rounded-tl-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-artemis-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-artemis-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-artemis-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-artemis-dark border-t border-white/10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          
          <button 
            onClick={toggleRecording}
            className={`p-4 rounded-full transition-all duration-300 relative ${isRecording ? 'bg-red-500/20 text-red-500' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
          >
            {isRecording && (
              <motion.div 
                className="absolute inset-0 bg-red-500 rounded-full mix-blend-screen"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
          </button>

          <form onSubmit={handleSendText} className="flex-1 relative">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-14 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-artemis-primary/50 transition-all"
              disabled={isRecording || isThinking}
            />
            <button 
              type="submit"
              disabled={!inputText.trim() || isRecording || isThinking}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-artemis-primary hover:bg-artemis-primary/80 disabled:opacity-50 disabled:hover:bg-artemis-primary text-white rounded-full transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
