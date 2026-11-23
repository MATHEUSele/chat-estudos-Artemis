# Artemis 2.0A 🌌

**Artemis 2.02** é a evolução de um projeto acadêmico de Inteligência Artificial para um assistente virtual moderno, performático e visualmente impressionante. Originalmente idealizado no segundo período do curso de Sistemas de Informação, a arquitetura foi reconstruída do zero para refletir padrões de excelência da indústria (MVC, microsserviços, assincronicidade, WebSockets e Containerização).

---

## 📁 Estrutura do Projeto

```text
chat-estudos-Artemis/
├── backend/                # API FastAPI, SQLite (aiosqlite) e cliente Ollama
│   ├── controllers/        # Rotas REST e WebSocket (/ws/chat)
│   ├── models/             # Agente Ollama e modelos ORM (SQLAlchemy)
│   ├── schemas/            # Schemas Pydantic
│   ├── config.py           # Leitura de variáveis de ambiente (.env)
│   ├── database.py         # Conexão assíncrona com SQLite
│   ├── main.py             # Entrypoint da API FastAPI
│   ├── requirements.txt    # Dependências Python
│   └── Dockerfile          # Imagem Docker do backend
├── frontend/               # SPA React + Vite + Tailwind CSS 4
│   ├── public/             # Arquivos estáticos (favicon)
│   ├── src/
│   │   ├── components/     # ChatView e Sidebar
│   │   ├── hooks/          # WebSocket e gravação de áudio
│   │   └── store/          # Estado global com Zustand
│   ├── nginx.conf          # Configuração Nginx para produção
│   └── Dockerfile          # Multi-stage build do frontend
├── docs/                   # Documentação e planejamento
│   ├── LLM_LOCAL.md        # Guia completo da LLM local (Ollama nativo)
│   └── BACKLOG.md          # Backlog, e-prints de PR e roadmap de melhorias
├── scripts/                # Utilitários de automação
│   └── start-local.ps1     # Inicialização local (Ollama + Backend + Frontend)
├── docker-compose.yml      # Orquestração dos containers
└── Makefile                # Atalhos para setup, execução local e Docker
```

---

## 🚀 Arquitetura e Tecnologias

### 1. Frontend Premium (Interface e Interatividade)
- **React + Vite:** Construção ultrarrápida e componentizada em JavaScript (JSX).
- **Tailwind CSS 4 & Glassmorphism:** Estilização moderna com temas escuros (Dark Mode), transparências translúcidas e toques "neon".
- **Nginx:** Servidor web reverso de altíssima performance para servir os builds estáticos do SPA de forma containerizada.
- **Framer Motion & Zustand:** Animações fluidas e gerenciamento de estado global.
- **Microfone Opus:** Captura de voz otimizada para o codec `audio/webm;codecs=opus`, minimizando latência.

### 2. Backend Robusto (Lógica e API)
- **FastAPI (Python):** Servidor rápido e operando de forma assíncrona.
- **SQLAlchemy + aiosqlite:** Banco de dados SQLite persistente.
- **WebSockets (`ws://`):** Túnel bidirecional em tempo real entre o usuário e o servidor de IA.
- **SlowAPI:** Rate limiting seguro (`5/minute` na rota `/health`) para proteção da API.

### 3. Motor de Inteligência Artificial (Ollama)
- Infraestrutura **100% local e privada**, sem dependência de APIs externas.
- Suporta execução via **Ollama nativo** na máquina local (recomendado para testes rápidos com modelos leves como `qwen2.5:0.5b`) ou via **container Docker** (`qwen2.5-coder:1.5b` / `7b`).
- 📖 **Guias:** [Guia da LLM Local](./docs/LLM_LOCAL.md) | [Backlog e Roadmap](./docs/BACKLOG.md)

---

## 🛠️ Como Instalar e Rodar Localmente

Você pode rodar o Artemis de duas formas: **nativamente no Windows (sem Docker)** ou **via Docker**.

### ⚡ Opção 1: Execução Local Nativa (Windows / Sem Docker — Mais Rápida)

Ideal para desenvolvimento e testes rápidos utilizando o Ollama instalado diretamente na máquina e o modelo leve `qwen2.5:0.5b` (~397 MB), que fica persistido em disco (`%USERPROFILE%\.ollama\models`).

1. **Configurar dependências (apenas na 1ª execução)**
   ```bash
   make setup-W
   ```

2. **Configurar o `backend/.env`**
   ```env
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=qwen2.5:0.5b
   FRONTEND_URL=http://localhost:5173
   ```
   *(Se a variável `OLLAMA_HOST` do Windows apontar para outro IP, use esse IP em `OLLAMA_BASE_URL`. Veja [docs/LLM_LOCAL.md](./docs/LLM_LOCAL.md)).*

3. **Iniciar Ollama + Backend + Frontend**
   ```powershell
   .\scripts\start-local.ps1
   ```
   Ou, se o Ollama já estiver rodando:
   ```bash
   make run-W
   ```

4. **Acessar a Plataforma**
   - 🌐 **Chat Interface:** http://localhost:5173/Art-mis/
   - ⚙️ **Backend Health:** http://127.0.0.1:8000/health

### 🐳 Opção 2: Executando com Docker *(🚧 Em desenvolvimento — criação da persistência no Docker)*

> [!NOTE]
> **Em desenvolvimento:** A configuração de persistência completa para o ambiente Docker (volumes, modelo leve padrão e fluxo automatizado) está em andamento. Por enquanto, utilize a **Opção 1 (Execução Local Nativa)** acima.

1. **Subir os Servidores (Construir e Iniciar os Containers)**
   Na raiz do projeto, execute:
   ```bash
   make docker-up
   ```

2. **Baixar o Modelo de IA (Apenas na 1ª execução)**
   Para que o chat funcione, o Ollama precisa baixar o modelo local.
   ```bash
   make ollama-pull
   ```

3. **Acessar a Plataforma**
   - 🌐 **Chat Interface:** http://localhost/Art-mis/
   - ⚙️ **Backend Health:** http://localhost:8000/health

*(Comandos auxiliares: `make docker-down` para parar, `make docker-build` para recompilar e `make docker-logs` para ver o que está rodando em tempo real).*

---

## 🔐 Configuração do Ambiente

Na pasta `/backend`, crie ou verifique o arquivo `.env` (baseado no `backend/.env.example`):

```env
# Motor de IA — Ollama container (mesma rede Docker)
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=qwen2.5-coder:7b

# URL do frontend para regras de CORS
FRONTEND_URL=http://localhost
```

---

*Projeto desenvolvido com dedicação e foco em design premium, IA open-source e alta performance.*
