# 📋 Backlog – Artemis 2.02

## Objetivo
Evoluir o protótipo de execução local para uma aplicação **pronta para produção**, **robusta** e **escalável** usando Docker, boas práticas de API, segurança, testes e observabilidade.

> **Legenda de Status:** `✅ Concluído` | `⏳ Pendente`

---

### 1️⃣ Arquitetura de Chat – SSE vs WebSocket
| # | Status | eprint (título do PR) | Descrição resumida | ✅ Critérios de aceitação |
|---|--------|-----------------------|-------------------|---------------------------|
| 1.1 | ✅ Concluído | **feat: migrar chat WebSocket → Server‑Sent Events (SSE)** | Substituir a rota WebSocket por um endpoint `/api/chat/stream` que devolve `text/event-stream`. SSE simplifica a passagem por proxies/Nginx e reduz overhead de conexão. | • Endpoint retorna SSE <br>• Front‑end consome via `EventSource` <br>• Testes unitários confirmam fluxo de tokens |
| 1.2 | ✅ Concluído | **refactor: consolidar modelo de mensagem no backend** | Criar `ChatMessage` e `ChatRequest` (Pydantic) em `schemas/chat_schema.py`; usar em todos os pontos do SSE. | • Validação de payload <br>• Docs OpenAPI mostrados corretamente |
| 1.3 | ✅ Concluído | **fix: tratamento de desconexão do cliente** | Dentro do gerador SSE, checar `await request.is_disconnected()` a cada chunk e abortar a chamada a Ollama. | • Logs mostram desconexão do cliente <br>• Consumo de recursos do Ollama cessado ao abortar |

---

### 2️⃣ Persistência Docker – Volumes & Modelos
| # | Status | eprint (título do PR) | Descrição resumida | ✅ Critérios de aceitação |
|---|--------|-----------------------|-------------------|---------------------------|
| 2.1 | ✅ Concluído | **feat: configurar volume nomeado `ollama_data`** | Já existe, mas precisa ser documentado e usado no `docker‑compose.yml` para **todos** os serviços (backend e frontend) via `depends_on`. | • `docker compose up -d` persiste modelo entre reinicializações <br>• `docker volume ls` mostra `ollama_data` |
| 2.2 | ✅ Concluído | **feat: definir modelo padrão leve (`qwen2.5:0.5b`)** | Atualizar `backend/.env` (para Docker) → `OLLAMA_MODEL=qwen2.5:0.5b`. Criar script `docker‑compose.override.yml` que execute `ollama pull $OLLAMA_MODEL` como *init* do container. | • `docker compose up` baixa automaticamente o modelo leve <br>• `docker logs artemis‑ollama` mostra “model pulled” |
| 2.3 | ✅ Concluído | **refactor: separar `.env.docker`** | Manter dois arquivos: `.env` (local) e `.env.docker` (Docker). `docker‑compose.yml` referenciar `env_file: .env.docker`. | • `.env.docker` contém apenas variáveis de ambiente Docker <br>• `make docker‑up` carrega corretamente |
| 2.4 | ⏳ Pendente | **docs: tutorial “Persistência Docker passo‑a‑passo”** | Atualizar `README.md` com seção **Docker → Persistência** (com diagramas Mermaid). | • README renderiza corretamente (GitHub preview) <br>• Usuário consegue reproduzir o fluxo em 5 minutos |

---

### 3️⃣ Segurança & Controle de Acesso
| # | Status | eprint (título do PR) | Descrição resumida | ✅ Critérios de aceitação |
|---|--------|-----------------------|-------------------|---------------------------|
| 3.1 | ⏳ Pendente | **feat: habilitar CORS configurável** | Centralizar `allow_origins` em `.env` (`FRONTEND_URLS`) e usar `CORSMiddleware` dinamicamente. | • Só origens listadas são aceitas <br>• Teste de integração falha para origem não autorizada |
| 3.2 | ⏳ Pendente | **feat: rate‑limit por IP (SlowAPI)** | Parametrizar limite (`RATE_LIMIT=5/minute`) via `.env`. | • Valor pode ser alterado sem code change <br>• Logs exibem `X-RateLimit-Remaining` |
| 3.3 | ⏳ Pendente | **security: ocultar cabeçalhos de servidor** | Remover `Server: uvicorn` e `X-Powered-By` via `Starlette` middleware. | • Resposta HTTP não contém cabeçalhos de identificação |
| 3.4 | ⏳ Pendente | **feat: health‑check de Ollama** | Endpoint `/health/ollama` que verifica `http://ollama:11434/api/tags`. | • Retorna `200` somente se Ollama saudável <br>• Utilizado por `docker‑compose` healthcheck |

---

### 4️⃣ Testes Automatizados
| # | Status | eprint (título do PR) | Descrição resumida | ✅ Critérios de aceitação |
|---|--------|-----------------------|-------------------|---------------------------|
| 4.1 | ⏳ Pendente | **test: coverage ≥ 85 %** | Adicionar testes de unidade para `ollama_agent.stream_chat_response` (mock `httpx`). | • `pytest --cov` > 85 % |
| 4.2 | ⏳ Pendente | **test: integração SSE** | Testar endpoint `/api/chat/stream` usando `httpx.AsyncClient` + `stream=True`. | • Verifica chunk‑by‑chunk e final `[DONE]` |
| 4.3 | ⏳ Pendente | **ci: GitHub Actions** | Workflow que roda lint (`ruff`), type‑check (`mypy`), testes e build do Docker. | • CI passa em PRs sem falhas |
| 4.4 | ⏳ Pendente | **test: esquema DB** | Testar migração e CRUD da tabela `messages` usando `AsyncSessionLocal`. | • DB SQLite em memória + fixtures |

---

### 5️⃣ Observabilidade & Logging
| # | Status | eprint (título do PR) | Descrição resumida | ✅ Critérios de aceitação |
|---|--------|-----------------------|-------------------|---------------------------|
| 5.1 | ⏳ Pendente | **feat: integração OpenTelemetry** | Exportar spans para console e (opcional) Jaeger. | • Traces de request → Ollama visíveis |
| 5.2 | ⏳ Pendente | **feat: logs estruturados (json)** | Substituir `logging.basicConfig` por `structlog` com nível configurável (`LOG_LEVEL`). | • Arquivo `logs.jsonl` parseável |
| 5.3 | ⏳ Pendente | **monitor: health‑check Prometheus** | Expor `/metrics` com `prometheus_client` (requests, erros, tempo de resposta). | • `docker compose up` inclui `prometheus` opcional |
| 5.4 | ⏳ Pendente | **docs: diagramas de fluxo** | Mermaid diagram no `README` mostrando: Frontend → SSE → FastAPI → Ollama → Modelo. | • Diagrama renderiza no GitHub README |

---

### 6️⃣ Deploy & CI/CD
| # | Status | eprint (título do PR) | Descrição resumida | ✅ Critérios de aceitação |
|---|--------|-----------------------|-------------------|---------------------------|
| 6.1 | ⏳ Pendente | **ci: build multi‑arch Docker images** | `Dockerfile` usa `BUILDPLATFORM`/`TARGETPLATFORM` para `linux/amd64` e `linux/arm64`. | • `docker buildx` gera ambas as tags |
| 6.2 | ⏳ Pendente | **ci: versionamento automático** | GitHub Action que gera tag semver (`vX.Y.Z`) a partir de `git describe`. | • Tag criada na release do PR merge |
| 6.3 | ⏳ Pendente | **deploy: helm chart (optional)** | Helm chart básico (`Chart.yaml`, `values.yaml`) para instalar no k8s. | • `helm install artemis ./chart` funciona |
| 6.4 | ⏳ Pendente | **doc: Guia de CI/CD no README** | Passo‑a‑passo para usar Actions, Docker Hub e Helm. | • Usuário pode seguir sem confusão |

---

### 7️⃣ Experiência do Usuário (Frontend)
| # | Status | eprint (título do PR) | Descrição resumida | ✅ Critérios de aceitação |
|---|--------|-----------------------|-------------------|---------------------------|
| 7.1 | ⏳ Pendente | **feat: barra de carregamento de tokens** | UI mostra “recebendo…” enquanto SSE está ativa. | • Spinner desaparece ao receber `[DONE]` |
| 7.2 | ⏳ Pendente | **feat: histórico de conversa persistido** | Salvar mensagens no `localStorage` e recarregar ao abrir a página. | • Conversa anterior permanece após reload |
| 7.3 | ⏳ Pendente | **fix: correção de CSS para tema escuro** | Garantir contraste suficiente em modo Dark. | • Teste visual manual aprovado |
| 7.4 | ⏳ Pendente | **docs: component diagram (React)** | Mermaid diagram no `frontend/README.md` mostrando fluxo de estado. | • Renderiza no GitHub e no README local |

---

## 📅 Roadmap (sprint‑wise)
| Sprint | Duração | Status | Itens Prioritários | Comentário |
|--------|---------|--------|--------------------|------------|
| **Sprint 1** | 2 sem | 🟡 Em andamento (6/8) | ~~1.1~~, ~~1.2~~, ~~1.3~~, ~~2.1~~, ~~2.2~~, ~~2.3~~, 3.1, 3.2 | SSE, schema consolidado, desconexão do cliente e persistência/ambientes Docker concluídos; restam CORS & rate‑limit. |
| **Sprint 2** | 2 sem | ⏳ Pendente | 4.1, 4.2, 4.3, 5.1, 5.2 | Testes e observabilidade – melhorar coverage, instrumentar traces, logs estruturados. |
| **Sprint 3** | 2 sem | ⏳ Pendente | 2.4, 3.3, 3.4, 6.1, 6.2 | Documentação de persistência, hardening de segurança, CI multi‑arch. |
| **Sprint 4** | 2 sem | ⏳ Pendente | 7.1, 7.2, 7.3, 7.4, 6.3, 6.4 | Polimento da UI, helm chart e guia de deployment. |
| **Sprint 5** | 1 sem | ⏳ Pendente | **Bug‑hunt & Refactor** | Revisar issues abertas, atualizar dependências, melhorar performance. |

---

## 🔧 Como iniciar os trabalhos
1. **Crie uma branch de feature** (ex.: `feature/sse-chat`) a partir de `development`.
2. **Abra o PR** usando o *eprint* correspondente como título.  
   - No corpo, cole a *Descrição resumida* e a lista de *Critérios de aceitação*.
   - Marque os **labels**: `enhancement`, `backend`, `frontend`, `docker` conforme o caso.
3. **Link de dependência** – Se o PR depender de outro (ex.: SSE depende da nova schema), adicione `depends on #<PR‑id>` no comentário.
4. **Acompanhe o CI** – Lint, test e build serão disparados automaticamente.
5. **Merge** somente após aprovação de ao menos **um revisor** e **passar todos os checks**.

---

### 📂 Artefatos que ainda precisam ser criados (para facilitar)
| Arquivo | Status | Por quê | Próximo PR |
|---------|--------|----------|------------|
| `backend/schemas/chat_schema.py` | ✅ Concluído | Consolidado com `ChatMessage`, `ChatRequest` e `ChatStreamEvent`. | PR 1.2 |
| `backend/utils/health.py` | ⏳ Pendente | Health‑check de Ollama. | PR 3.4 |
| `backend/logging.py` | ⏳ Pendente | Configuração `structlog`. | PR 5.2 |
| `frontend/src/components/LoadingBar.jsx` | ⏳ Pendente | UI spinner de token. | PR 7.1 |
| `docker-compose.override.yml` | ✅ Concluído | Executar `ollama pull $OLLAMA_MODEL` na inicialização. | PR 2.2 |
| `chart/Chart.yaml` + `values.yaml` | ⏳ Pendente | Helm chart. | PR 6.3 |

---

## ✅ Próximos passos imediatos
- [x] **1.1 & 1.3 (SSE migration + desconexão do cliente)** — concluído no commit `ef653cc`.
- [x] **1.2 (consolidar schema `ChatMessage` / `ChatRequest`)** — concluído com validação Pydantic e exposição no OpenAPI.
- [x] **2.1 (volume nomeado `ollama_data` + `depends_on` com healthchecks)** — configurado em `docker-compose.yml` e documentado no `README.md`.
- [x] **2.2 & 2.3 (modelo leve padrão + `.env.docker`)** — concluídos com `docker-compose.override.yml` e `backend/.env.docker`.
- [ ] **3.1 / 3.2 (CORS configurável + rate-limit por IP)** — fechar a Sprint 1.
- [ ] **2.4 (Documentação de Persistência Docker)** — atualizar o `README.md` com o tutorial passo a passo.
