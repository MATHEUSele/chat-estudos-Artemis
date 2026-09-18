# Artemis 2.01 🌌

**Artemis 2.01** é a evolução de um projeto acadêmico de Inteligência Artificial para um assistente virtual moderno, performático e visualmente impressionante. Originalmente idealizado no segundo período do curso de Sistemas de Informação, a arquitetura foi reconstruída do zero para refletir padrões de excelência da indústria (MVC, microsserviços, assincronicidade e WebSockets).

## 🚀 Arquitetura e Tecnologias

O projeto é dividido em duas camadas principais:

### 1. Frontend Premium (Interface e Interatividade)
- **React + Vite:** Construção ultrarrápida, componentizada e tipada com **TypeScript**.
- **Tailwind CSS 4 & Glassmorphism:** Estilização moderna com temas escuros (Dark Mode), transparências translúcidas e toques "neon". Utiliza `clsx` e `tailwind-merge` para classes dinâmicas.
- **Framer Motion:** Animações fluidas e efeitos responsivos.
- **Zustand:** Gerenciamento de estado global leve e sem boilerplate.
- **React Router DOM:** Roteamento de páginas fluido no lado do cliente.
- **Lucide React & Sonner:** Ícones modernos e sistema de notificações (toasts) elegante.
- **Microfone Opus:** Captura de voz otimizada para o codec `audio/webm;codecs=opus`, minimizando latência.

### 2. Backend Robusto (Lógica e Integração IA)
- **FastAPI (Python):** Servidor extremamente rápido que roda de forma assíncrona, usando **Pydantic** para validação de dados rigorosa.
- **SQLAlchemy + aiosqlite:** Banco de dados SQLite operando 100% de forma assíncrona (`async/await`) sem travar o Event Loop.
- **WebSockets (`wss://`):** Túnel bidirecional em tempo real entre o usuário e a IA.
- **Google Gemini:** Integração de ponta via SDK oficial (`google-genai`), suportando Tool Calling nativo para enriquecer o contexto.
- **SlowAPI:** Rate limiting seguro (`5/minute` na rota health check) para proteção da API.
- **CORS Configurado:** Suporte nativo para deploy do frontend via GitHub Pages.

---

## 🛠️ Como Instalar e Rodar Localmente

Todo o fluxo de desenvolvimento foi simplificado utilizando o utilitário `Make`.

### 🪟 Para usuários Windows:

1. **Instalar Dependências (Frontend e Backend)**
```bash
make setup-W
```

2. **Subir os Servidores (Inicia React e FastAPI juntos)**
```bash
make run-W
```

### 🐧 Para usuários Linux/macOS:

1. **Instalar Dependências**
```bash
make setup-L
```

2. **Subir os Servidores**
```bash
make run-L
```

---

## 🌐 Deploy no GitHub Pages

O projeto possui um comando automatizado para gerar o build estático do frontend pronto para o GitHub Pages:

```bash
make build
```
*(A pasta `frontend/dist` será gerada contendo os arquivos prontos para deploy).*

---

## 🔐 Configuração do Ambiente

Na pasta `/backend`, crie ou verifique o arquivo `.env`. Ele deve conter a chave de autenticação do Google AI Studio para que o servidor consiga se comunicar com o modelo Gemini, e a URL do frontend.

```env
GEMINI_API_KEY=sua_chave_aqui
FRONTEND_URL=http://localhost:5173
```

---

*Projeto desenvolvido com dedicação e foco em design premium e alta performance.*
