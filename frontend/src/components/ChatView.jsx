import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { Mic, Send, Bot, User, Search, Square, Sparkles, Code, Image as ImageIcon, FileText } from 'lucide-react';
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
    toast.success("Áudio processado (Integração na Fase 5)");
  };
  const { isRecording: isMicActive, toggleRecording: handleMicToggle } = useAudioRecorder(handleAudioReady);

  const handleSendText = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    
    sendMessage(inputText);
    setInputText('');
  };

  const handleSuggestion = (text) => {
    sendMessage(text);
  };

  const toggleRecording = () => {
    handleMicToggle();
  };

  return (
    <div className="flex flex-col h-full bg-artemis-dark relative">
      {/* Header */}
      <header className="h-14 flex items-center justify-center border-b border-white/5 bg-artemis-dark/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-200">Artemis 2.0</span>
          <span className="text-xs bg-artemis-primary/20 text-artemis-primary px-2 py-0.5 rounded-full font-medium">Beta</span>
        </div>
        
        <div className="absolute right-4 flex items-center gap-2">
          <AnimatePresence>
            {isSearching && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 text-xs bg-artemis-secondary/20 text-artemis-secondary px-3 py-1 rounded-full"
              >
                <Search className="w-3 h-3 animate-pulse" />
                <span className="hidden sm:inline">Pesquisando</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto scroll-smooth w-full flex flex-col">
        {messages.length === 0 && !isThinking ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-3xl mx-auto w-full mt-10 mb-20">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-8 text-center">Como posso ajudar hoje?</h2>
            
            {/* Grid de Sugestões */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {[
                { icon: <Code className="w-5 h-5 text-blue-400" />, title: 'Criar um script em Python', subtitle: 'para automatizar tarefas diárias' },
                { icon: <Sparkles className="w-5 h-5 text-purple-400" />, title: 'Me dê ideias criativas', subtitle: 'para um projeto de design' },
                { icon: <FileText className="w-5 h-5 text-green-400" />, title: 'Resumir este texto', subtitle: 'os pontos principais' },
                { icon: <ImageIcon className="w-5 h-5 text-orange-400" />, title: 'Gerar uma imagem', subtitle: 'de uma paisagem futurista' },
              ].map((sug, i) => (
                <button 
                  key={i}
                  onClick={() => handleSuggestion(`${sug.title} ${sug.subtitle}`)}
                  className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-left transition-colors flex flex-col gap-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-200 text-sm group-hover:text-white transition-colors">{sug.title}</span>
                    {sug.icon}
                  </div>
                  <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">{sug.subtitle}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-4 max-w-[95%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-white/10 text-gray-300' : 'bg-artemis-primary text-white'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-full overflow-hidden`}>
                      <span className="text-xs text-gray-500 mb-1 px-1">{msg.role === 'user' ? 'Você' : 'Artemis'}</span>
                      <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-white/10 text-white rounded-tr-sm' : 'bg-transparent text-gray-100 px-2'}`}>
                        <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-base break-words">
                          {msg.content}
                        </p>
                      </div>
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
                  <div className="flex gap-4 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-artemis-primary text-white">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-gray-500 mb-1 px-1">Artemis</span>
                      <div className="p-4 px-2 flex items-center gap-1.5 h-[52px]">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} className="h-4" />
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-artemis-dark/95 backdrop-blur-md sticky bottom-0">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={handleSendText} className="relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-white/20 focus-within:bg-white/10 transition-colors shadow-lg">
            
            <button 
              type="button"
              onClick={toggleRecording}
              className={`p-3 rounded-xl transition-colors ${isRecording ? 'bg-red-500/20 text-red-500' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
            >
              {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
            </button>

            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendText(e);
                }
              }}
              placeholder="Envie uma mensagem para a Artemis..."
              className="w-full bg-transparent text-white placeholder-gray-500 resize-none max-h-32 min-h-[44px] py-3 focus:outline-none scrollbar-hide text-base leading-relaxed"
              rows={1}
              disabled={isRecording || isThinking}
            />
            
            <button 
              type="submit"
              disabled={!inputText.trim() || isRecording || isThinking}
              className="p-3 bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:bg-white/10 disabled:text-gray-500 rounded-xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-3 text-xs text-gray-500">
            A Artemis pode cometer erros. Considere verificar informações importantes.
          </div>
        </div>
      </footer>
    </div>
  );
}
