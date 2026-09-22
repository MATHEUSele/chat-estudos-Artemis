# Artemis 2.02 🌌

**Artemis 2.02** é a evolução de um projeto acadêmico de Inteligência Artificial para um assistente virtual moderno, performático e visualmente impressionante. Originalmente idealizado no segundo período do curso de Sistemas de Informação, a arquitetura foi reconstruída do zero para refletir padrões de excelência da indústria (MVC, microsserviços, assincronicidade, WebSockets e Containerização).

## 🚀 Arquitetura e Tecnologias

O projeto é dividido em camadas isoladas rodando em containers Docker:

### 1. Frontend Premium (Interface e Interatividade)
- **React + Vite:** Construção ultrarrápida, componentizada e tipada com **TypeScript**.
- **Tailwind CSS 4 & Glassmorphism:** Estilização moderna com temas escuros (Dark Mode), transparências translúcidas e toques "neon".
- **Nginx:** Servidor web reverso de altíssima performance para servir os builds estáticos do SPA de forma containerizada.
- **Framer Motion & Zustand:** Animações fluidas e gerenciamento de estado global.
- **Microfone Opus:** Captura de voz otimizada para o codec `audio/webm;codecs=opus`, minimizando latência.

### 2. Backend Robusto (Lógica e API)
- **FastAPI (Python):** Servidor rápido e operando de forma assíncrona.
- **SQLAlchemy + aiosqlite:** Banco de dados SQLite persistente através de Volumes Docker.
- **WebSockets (`ws://`):** Túnel bidirecional em tempo real entre o usuário e o servidor de IA.
- **SlowAPI:** Rate limiting seguro (`5/minute` na rota health check) para proteção da API.

### 3. Motor de Inteligência Artificial (Ollama)
- Substituímos dependências de APIs externas (como o Google Gemini) por uma infraestrutura **100% local e privada**.
- Motor integrado via container dedicado rodando o **Ollama**.
- Modelo padrão altamente focado em código e conversação em português: `qwen2.5-coder:7b`.

---

## 🛠️ Como Instalar e Rodar Localmente

Todo o fluxo de desenvolvimento e deploy agora foi padronizado utilizando **Docker** e automatizado com o utilitário `Make`.

### 🐳 Executando a Aplicação (Recomendado)

1. **Subir os Servidores (Construir e Iniciar os Containers)**
   Na raiz do projeto, execute:
   ```bash
   make docker-up
   ```

2. **Baixar o Modelo de IA (Apenas na 1ª execução)**
   Para que o chat funcione, o Ollama precisa baixar o modelo local (~4.7GB).
   ```bash
   make ollama-pull
   ```

3. **Acessar a Plataforma**
   - 🌐 **Chat Interface:** http://localhost/Art-mis/
   - ⚙️ **Backend Health:** http://localhost:8000/health

*(Comandos auxiliares: `make docker-down` para parar, `make docker-build` para recompilar e `make docker-logs` para ver o que está rodando em tempo real).*

---

## 🔐 Configuração do Ambiente

Na pasta `/backend`, crie ou verifique o arquivo `.env` (baseado no `backend/.env.example`). O arquivo mudou e não exige mais chaves de API:

```env
# Motor de IA — Ollama container (mesma rede Docker)
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=qwen2.5-coder:7b

# URL do frontend para regras de CORS
FRONTEND_URL=http://localhost
```

---

*Projeto desenvolvido com dedicação e foco em design premium, IA open-source e alta performance.*
