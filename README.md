# Artemis 2.0 🌌

**Artemis 2.0** é a evolução de um projeto acadêmico de Inteligência Artificial para um assistente virtual moderno, performático e visualmente impressionante. Originalmente idealizado no segundo período do curso de Sistemas de Informação, a arquitetura foi reconstruída do zero para refletir padrões de excelência da indústria (MVC, microsserviços, assincronicidade e WebSockets).

## 🚀 Arquitetura e Tecnologias

O projeto é dividido em duas camadas principais:

### 1. Frontend Premium (Interface e Interatividade)
- **React + Vite:** Para uma construção ultrarrápida e componentizada.
- **Tailwind CSS & Glassmorphism:** Estilização moderna com temas escuros (Dark Mode), transparências translúcidas e uma paleta com toques "neon".
- **Framer Motion:** Animações fluidas e efeitos de Parallax responsivos à rolagem (Scroll).
- **Zustand:** Gerenciamento de estado global leve e sem boilerplate.
- **Microfone Opus:** Captura de voz otimizada para o codec `audio/webm;codecs=opus`, minimizando a latência.

### 2. Backend Robusto (Lógica e Integração IA)
- **FastAPI (Python):** Substituiu o framework síncrono legado. Servidor extremamente rápido que roda de forma assíncrona.
- **SQLAlchemy + aiosqlite:** Banco de dados SQLite operando 100% de forma assíncrona (`async/await`) sem travar o Event Loop.
- **WebSockets (`wss://`):** Túnel bidirecional em tempo real entre o usuário e a IA. Sem necessidade de long-polling.
- **Google Gemini (Interactions API):** Integração de ponta com o modelo *Gemini 1.5 Flash*, suportando Tool Calling nativo (Google Search) para enriquecer o contexto antes de responder.
- **SlowAPI:** Rate limiting seguro para proteção da API.

---

## 🛠️ Como Instalar e Rodar Localmente

Todo o fluxo de desenvolvimento foi simplificado utilizando o `Make`.

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

## 🔐 Configuração do Ambiente

Na pasta `/backend`, crie ou verifique o arquivo `.env`. Ele deve conter a chave de autenticação do Google AI Studio para que o servidor consiga se comunicar com o modelo Gemini.

```env
GEMINI_API_KEY=sua_chave_aqui
```

---

*Projeto desenvolvido com dedicação e foco em design premium e alta performance.*
