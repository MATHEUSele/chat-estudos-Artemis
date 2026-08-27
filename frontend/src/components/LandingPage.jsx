import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  
  // Parallax effects
  const yText = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityText = useTransform(scrollY, [0, 300], [1, 0]);
  const scaleBg = useTransform(scrollY, [0, 500], [1, 1.2]);

  return (
    <div className="relative min-h-[150vh] bg-artemis-dark text-white overflow-hidden">
      {/* Premium Gradient Background */}
      <motion.div 
        style={{ scale: scaleBg }}
        className="fixed inset-0 z-0 bg-hero-glow opacity-20 blur-3xl rounded-full translate-y-[-20%] translate-x-[-10%]"
      />
      
      <div className="relative z-10 flex flex-col items-center justify-start pt-[25vh] px-4">
        
        <motion.div 
          style={{ y: yText, opacity: opacityText }}
          className="text-center"
        >
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
          >
            <Sparkles className="w-4 h-4 text-artemis-secondary" />
            <span className="text-sm font-medium tracking-wide">Bem-vindo à Artemis 2.0</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
          >
            A Inteligência<br />Elevada.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12"
          >
            Uma assistente virtual de última geração com reconhecimento de voz em tempo real, 
            busca integrada e um design focado na excelência.
          </motion.p>

          <motion.button
            onClick={() => navigate('/chat')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-full overflow-hidden"
          >
            <span className="relative z-10">Iniciar Conversa</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-artemis-primary to-artemis-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 group-hover:text-white transition-colors duration-300 absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
              Iniciar Conversa <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* Fake Parallax Content */}
      <div className="relative z-10 mt-[30vh] bg-artemis-dark/80 backdrop-blur-xl border-t border-white/10 p-12 text-center h-[50vh]">
        <h2 className="text-3xl font-semibold mb-4 text-white/90">Tecnologia de Ponta</h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          Impulsionada pelo modelo Gemini e estruturada em uma arquitetura de alta performance.
          Role para cima para iniciar.
        </p>
      </div>
    </div>
  );
}
