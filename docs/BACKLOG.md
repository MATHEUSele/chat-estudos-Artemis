# 📋 Backlog – Artemis 2.02

## Objetivo
Evoluir o protótipo de execução local para uma aplicação **pronta para produção**, **robusta** e **escalável** usando Docker, boas práticas de API, segurança, testes e observabilidade.

---

### 1️⃣ Arquitetura de Chat – SSE vs WebSocket
| # | eprint (título do PR) | Descrição resumida | ✅ Critérios de aceitação |
|---|-----------------------|-------------------|---------------------------|
| 1.1 | **feat: migrar chat WebSocket → Server‑Sent Events (SSE)** | Substituir a rota WebSocket por um endpoint `/api/chat/stream` que devolve `text/event-stream`. SSE simplifica a passagem por proxies/Nginx e reduz overhead de conexão. | • Endpoint retorna SSE <br>• Front‑end consome via `EventSource` <br>• Testes unitários confirmam fluxo de tokens |
| 1.2 | **refactor: consolidar modelo de mensagem no backend** | Criar `ChatMessage` e `ChatRequest` (Pydantic) em `schemas/chat_schema.py`; usar em todos os pontos (SSE, WebSocket legacy). | • Validação de payload <br>• Docs OpenAPI mostrados corretamente |
| 1.3 | **fix: tratamento de desconexão do cliente** | Dentro do gerador SSE, checar `await request.is_disconnected()` a cada chunk e abortar a chamada a Ollama. | • Logs mostram “client disconnected” <br>• Consumo de recursos do Ollama cessado ao abortar |

---

### 2️⃣ Persistência Docker – Volumes & Modelos
| # | eprint (título do PR) | Descrição resumida | ✅ Critérios de aceitação |
|---|-----------------------|-------------------|---------------------------|
| 2.1 | **feat: configurar volume nomeado `ollama_data`** | Já existe, mas precisa ser documentado e usado no `docker‑compose.yml` para **todos** os serviços (backend e frontend) via `depends_on`. | • `docker compose up -d` persiste modelo entre reinicializações <br>• `docker volume ls` mostra `ollama_data` |
| 2.2 | **feat: definir modelo padrão leve (`qwen2.5:0.5b`)** | Atualizar `backend/.env` (para Docker) → `OLLAMA_MODEL=qwen2.5:0.5b`. Criar script `docker‑compose.override.yml` que execute `ollama pull $OLLAMA_MODEL` como *init* do container. | • `docker compose up` baixa automaticamente o modelo leve <br>• `docker logs artemis‑ollama` mostra “model pulled” |
| 2.3 | **refactor: separar `.env.docker`** | Manter dois arquivos: `.env` (local) e `.env.docker` (Docker). `docker‑compose.yml` referenciar `env_file: .env.docker`. | • `.env.docker` contém apenas variáveis de ambiente Docker <br>• `make docker‑up` carrega corretamente |
| 2.4 | **docs: tutorial “Persistência Docker passo‑a‑passo”** | Atualizar `README.md` com seção **Docker → Persistência** (com diagramas Mermaid). | • README renderiza corretamente (GitHub preview) <br>• Usuário consegue reproduzir o fluxo em 5 minutos |

---

### 3️⃣ Segurança & Controle de Acesso
| # | eprint (título do PR) | Descrição resumida | ✅ Critérios de aceitação |
|---|-----------------------|-------------------|---------------------------|
| 3.1 | **feat: habilitar CORS configurável** | Centralizar `allow_origins` em `.env` (`FRONTEND_URLS`) e usar `CORSMiddleware` dinamicamente. | • Só origens listadas são aceitas <br>• Teste de integração falha para origem não autorizada |
| 3.2 | **feat: rate‑limit por IP (SlowAPI)** | Parametrizar limite (`RATE_LIMIT=5/minute`) via `.env`. | • Valor pode ser alterado sem code change <br>• Logs exibem `X-RateLimit-Remaining` |
| 3.3 | **security: ocultar cabeçalhos de servidor** | Remover `Server: uvicorn` e `X-Powered-By` via `Starlette` middleware. | • Resposta HTTP não contém cabeçalhos de identificação |
| 3.4 | **feat: health‑check de Ollama** | Endpoint `/health/ollama` que verifica `http://ollama:11434/api/tags`. | • Retorna `200` somente se Ollama saudável <br>• Utilizado por `docker‑compose` healthcheck |

---

### 4️⃣ Testes Automatizados
| # | eprint (título do PR) | Descrição resumida | ✅ Critérios de aceitação |
|---|-----------------------|-------------------|---------------------------|
| 4.1 | **test: coverage ≥ 85 %** | Adicionar testes de unidade para `ollama_agent.stream_chat_response` (mock `httpx`). | • `pytest --cov` > 85 % |
| 4.2 | **test: integração SSE** | Testar endpoint `/api/chat/stream` usando `httpx.AsyncClient` + `stream=True`. | • Verifica chunk‑by‑chunk e final `[DONE]` |
| 4.3 | **ci: GitHub Actions** | Workflow que roda lint (`ruff`), type‑check (`mypy`), testes e build do Docker. | • CI passa em PRs sem falhas |
| 4.4 | **test: esquema DB** | Testar migração e CRUD da tabela `messages` usando `AsyncSessionLocal`. | • DB SQLite em memória + fixtures |

---

### 5️⃣ Observabilidade & Logging
| # | eprint (título do PR) | Descrição resumida | ✅ Critérios de aceitação |
|---|-----------------------|-------------------|---------------------------|
| 5.1 | **feat: integração OpenTelemetry** | Exportar spans para console e (opcional) Jaeger. | • Traces de request → Ollama visíveis |
| 5.2 | **feat: logs estruturados (json)** | Substituir `logging.basicConfig` por `structlog` com nível configurável (`LOG_LEVEL`). | • Arquivo `logs.jsonl` parseável |
| 5.3 | **monitor: health‑check Prometheus** | Expor `/metrics` com `prometheus_client` (requests, erros, tempo de resposta). | • `docker compose up` inclui `prometheus` opcional |
| 5.4 | **docs: diagramas de fluxo** | Mermaid diagram no `README` mostrando: Frontend → SSE → FastAPI → Ollama → Modelo. | • Diagrama renderiza no GitHub README |

---

### 6️⃣ Deploy & CI/CD
| # | eprint (título do PR) | Descrição resumida | ✅ Critérios de aceitação |
|---|-----------------------|-------------------|---------------------------|
| 6.1 | **ci: build multi‑arch Docker images** | `Dockerfile` usa `BUILDPLATFORM`/`TARGETPLATFORM` para `linux/amd64` e `linux/arm64`. | • `docker buildx` gera ambas as tags |
| 6.2 | **ci: versionamento automático** | GitHub Action que gera tag semver (`vX.Y.Z`) a partir de `git describe`. | • Tag criada na release do PR merge |
| 6.3 | **deploy: helm chart (optional)** | Helm chart básico (`Chart.yaml`, `values.yaml`) para instalar no k8s. | • `helm install artemis ./chart` funciona |
| 6.4 | **doc: Guia de CI/CD no README** | Passo‑a‑passo para usar Actions, Docker Hub e Helm. | • Usuário pode seguir sem confusão |

---

### 7️⃣ Experiência do Usuário (Frontend)
| # | eprint (título do PR) | Descrição resumida | ✅ Critérios de aceitação |
|---|-----------------------|-------------------|---------------------------|
| 7.1 | **feat: barra de carregamento de tokens** | UI mostra “recebendo…” enquanto SSE está ativa. | • Spinner desaparece ao receber `[DONE]` |
| 7.2 | **feat: histórico de conversa persistido** | Salvar mensagens no `localStorage` e recarregar ao abrir a página. | • Conversa anterior permanece após reload |
| 7.3 | **fix: correção de CSS para tema escuro** | Garantir contraste suficiente em modo Dark. | • Teste visual manual aprovado |
| 7.4 | **docs: component diagram (React)** | Mermaid diagram no `frontend/README.md` mostrando fluxo de estado. | • Renderiza no GitHub e no README local |

---

## 📅 Roadmap (sprint‑wise)
| Sprint | Duração | Itens Prioritários | Comentário |
|--------|---------|--------------------|------------|
| **Sprint 1** (2 sem) | 2 sem | 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2 | Primeiro _break‑the‑glass_ – migrar chat para SSE, garantir volume Docker, ajustar CORS & rate‑limit. |
| **Sprint 2** (2 sem) | 2 sem | 4.1, 4.2, 4.3, 5.1, 5.2 | Testes e observabilidade – melhorar coverage, instrumentar traces, logs estruturados. |
| **Sprint 3** (2 sem) | 2 sem | 2.4, 3.3, 3.4, 6.1, 6.2 | Documentação de persistência, hardening de segurança, CI multi‑arch. |
| **Sprint 4** (2 sem) | 2 sem | 7.1, 7.2, 7.3, 7.4, 6.3, 6.4 | Polimento da UI, helm chart e guia de deployment. |
| **Sprint 5** (1 sem) | 1 sem | **Bug‑hunt & Refactor** – revisar issues abertas, atualizar dependências, melhorar performance. |

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
| Arquivo | Por quê | Próximo PR |
|---------|----------|------------|
| `backend/schemas/chat_schema.py` | Definir `ChatMessage` / `ChatRequest`. | PR 1.2 |
| `backend/utils/health.py` | Health‑check de Ollama. | PR 3.4 |
| `backend/logging.py` | Configuração `structlog`. | PR 5.2 |
| `frontend/src/components/LoadingBar.jsx` | UI spinner de token. | PR 7.1 |
| `docker-compose.override.yml` | Executar `ollama pull $OLLAMA_MODEL` na inicialização. | PR 2.2 |
| `chart/Chart.yaml` + `values.yaml` | Helm chart. | PR 6.3 |

---

## ✅ Próximos passos imediatos
1. **Abrir PR 1.1** (SSE migration) – mudança central que impacta todas as demais features.
2. **Abrir PR 2.2** (modelo leve no Docker) – garante que o próximo ambiente de CI já use o modelo correto.
3. **Criar ticket** no GitHub **“Documentação de Persistência Docker”** para iniciar o conteúdo do README (eprint 2.4).

Assim que esses PRs forem revisados e mesclados, avançamos para a **Sprint 2** (testes/monitoramento). Boa codificação! 🚀