import React from 'react';
import { MessageSquare, Plus, Settings, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ isOpen, toggleSidebar }) {
  // Dados estáticos para visualização
  const recentChats = [
    { id: 1, title: 'Assistência com React' },
    { id: 2, title: 'Análise de Dados em Python' },
    { id: 3, title: 'Ideias de Design UI/UX' },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-20 w-64 bg-artemis-dark border-r border-white/5 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
      {/* Botão Novo Chat */}
      <div className="p-4">
        <button className="w-full flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-200 transition-colors border border-white/10 group">
          <Plus className="w-4 h-4 text-gray-400 group-hover:text-white" />
          <span>Novo Chat</span>
        </button>
      </div>

      {/* Histórico Recente */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Hoje</h3>
          <div className="space-y-1">
            {recentChats.map((chat) => (
              <button key={chat.id} className="w-full flex items-center gap-3 px-2 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-md transition-colors text-left truncate">
                <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                <span className="truncate">{chat.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rodapé (Usuário/Configurações) */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <button className="w-full flex items-center gap-3 px-2 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-md transition-colors">
          <Settings className="w-4 h-4 shrink-0" />
          <span>Configurações</span>
        </button>
        <button className="w-full flex items-center gap-3 px-2 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-md transition-colors">
          <div className="w-6 h-6 rounded-full bg-artemis-primary/20 flex items-center justify-center text-artemis-primary">
            <User className="w-3 h-3" />
          </div>
          <span>Minha Conta</span>
        </button>
      </div>
    </div>
  );
}
