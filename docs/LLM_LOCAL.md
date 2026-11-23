# Guia da LLM Local — Artemis 2.02 (Ollama Nativo)

Este documento explica como o **Artemis 2.02** se conecta a um modelo de linguagem (LLM) rodando **diretamente na sua máquina Windows**, sem necessidade de Docker ou APIs externas.

---

## 1. Como funciona a conexão com a LLM

O fluxo entre a interface web e o modelo local segue três etapas:

1. **Configuração (`backend/.env`):**
   Define o endereço do servidor Ollama e o nome do modelo utilizado:
   ```env
   OLLAMA_BASE_URL=http://100.117.96.67:11434
   OLLAMA_MODEL=qwen2.5:0.5b
   FRONTEND_URL=http://localhost:5173
   ```

2. **Leitura pelo Backend (`backend/config.py`):**
   A classe `Settings` (`pydantic_settings`) carrega essas variáveis do arquivo `.env` ao iniciar o FastAPI e as disponibiliza em `settings.OLLAMA_BASE_URL` e `settings.OLLAMA_MODEL`.

3. **Chamada em Streaming (`backend/models/ollama_agent.py`):**
   Quando uma mensagem chega no endpoint SSE (`/api/chat/stream`), a função `stream_chat_response` envia um `POST` assíncrono (`httpx`) para `{OLLAMA_BASE_URL}/api/generate` com `"stream": true` e transmite cada chunk (`text_chunk`) de volta para o frontend em tempo real via `EventSource`.

---

## 2. Persistência do Modelo e das Configurações

- **Modelo em disco:** Os modelos baixados via `ollama pull` ficam persistidos automaticamente no diretório do seu usuário (`%USERPROFILE%\.ollama\models`). Você não precisa baixá-los novamente ao reiniciar o computador.
- **Modelo padrão para testes rápidos:** `qwen2.5:0.5b` (~397 MB) — extremamente leve, rápido mesmo em CPU e compatível com respostas em português.
- **Configuração persistente:** O arquivo `backend/.env` mantém o modelo e a URL salvos entre execuções.
- **Banco de dados local:** O histórico de conversas é persistido em `backend/artemis.db` (SQLite).

---

## 3. Como iniciar tudo (Persistência de Execução)

Você pode subir **Ollama + Backend + Frontend** de uma só vez executando o script PowerShell na raiz do projeto:

```powershell
.\scripts\start-local.ps1
```

O script faz automaticamente:
1. Verifica se o Ollama está respondendo na `OLLAMA_BASE_URL` definida em `backend/.env` (e inicia `ollama serve` em segundo plano caso não esteja).
2. Confere se o `OLLAMA_MODEL` já está baixado localmente (fazendo `ollama pull` apenas se necessário).
3. Abre o Backend (`http://127.0.0.1:8000`) e o Frontend (`http://localhost:5173/Art-mis/`).

Alternativamente, caso já esteja com o Ollama rodando:
```bash
make run-W
```

---

## 4. Como trocar de modelo LLM

1. Liste os modelos já baixados na sua máquina:
   ```powershell
   ollama list
   ```
2. Caso queira baixar outro modelo (ex.: `qwen2.5-coder:1.5b` ou `qwen2.5-coder:7b`):
   ```powershell
   ollama pull qwen2.5-coder:1.5b
   ```
3. Atualize a linha `OLLAMA_MODEL` em `backend/.env`:
   ```env
   OLLAMA_MODEL=qwen2.5-coder:1.5b
   ```
4. Reinicie o backend para aplicar a alteração.

---

## 5. Observação sobre `OLLAMA_HOST` no Windows

Por padrão, o Ollama escuta em `http://localhost:11434`. Porém, se a variável de ambiente `OLLAMA_HOST` estiver definida no Windows para outro IP (por exemplo, `100.117.96.67` via Tailscale/rede), o Ollama responderá apenas nesse endereço.

- Para verificar qual IP está configurado no seu terminal:
  ```powershell
  echo $env:OLLAMA_HOST
  ```
- Garanta que `OLLAMA_BASE_URL` em `backend/.env` use o mesmo host/IP em que o `ollama serve` está escutando (ex.: `http://100.117.96.67:11434` ou `http://localhost:11434`).
