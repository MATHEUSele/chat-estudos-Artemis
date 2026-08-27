import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ChatView from './components/ChatView';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster theme="dark" position="top-center" />
      <BrowserRouter basename="/Art-mis/">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<ChatView />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
