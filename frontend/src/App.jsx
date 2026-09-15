import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import { Toaster } from 'sonner';
import { Menu } from 'lucide-react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-artemis-dark text-white">
      <Toaster theme="dark" position="top-center" />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Mobile Header (Hamburger Menu) */}
        <div className="md:hidden absolute top-3 left-4 z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-artemis-panel/80 backdrop-blur-md rounded-md text-white border border-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <ChatView />
      </div>
    </div>
  );
}

export default App;
