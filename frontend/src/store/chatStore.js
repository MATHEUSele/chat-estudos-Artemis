import { create } from 'zustand';

export const useChatStore = create((set) => ({
  messages: [],
  isRecording: false,
  isThinking: false,
  isSearching: false,
  
  // Ações
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  
  updateLastMessage: (chunk) => set((state) => {
    const newMessages = [...state.messages];
    const lastIdx = newMessages.length - 1;
    if (lastIdx >= 0 && newMessages[lastIdx].role === 'model') {
      newMessages[lastIdx] = {
        ...newMessages[lastIdx],
        content: newMessages[lastIdx].content + chunk,
      };
    }
    return { messages: newMessages };
  }),
  
  setRecording: (status) => set({ isRecording: status }),
  setThinking: (status) => set({ isThinking: status }),
  setSearching: (status) => set({ isSearching: status }),
}));
