# Script de inicialização local do Artemis (sem Docker)
# Lê as configurações de backend/.env e sobe Ollama, Backend e Frontend.

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$EnvFile = Join-Path $RootDir "backend\.env"

# Valores padrão
$OllamaUrl = "http://localhost:11434"
$OllamaModel = "qwen2.5:0.5b"

if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^\s*OLLAMA_BASE_URL\s*=\s*(.+)$') {
            $OllamaUrl = $Matches[1].Trim()
        }
        if ($_ -match '^\s*OLLAMA_MODEL\s*=\s*(.+)$') {
            $OllamaModel = $Matches[1].Trim()
        }
    }
}

Write-Host "=== Artemis 2.02 — Modo Local ===" -ForegroundColor Cyan
Write-Host "Ollama URL: $OllamaUrl"
Write-Host "Modelo:     $OllamaModel"

# 1. Verifica se o Ollama está respondendo; se não, inicia em segundo plano
$ollamaReady = $false
try {
    $resp = Invoke-WebRequest -Uri "$OllamaUrl/api/tags" -UseBasicParsing -TimeoutSec 2
    if ($resp.StatusCode -eq 200) { $ollamaReady = $true }
} catch {}

if (-not $ollamaReady) {
    Write-Host "Iniciando servidor Ollama em segundo plano..." -ForegroundColor Yellow
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
} else {
    Write-Host "Ollama já está rodando." -ForegroundColor Green
}

# 2. Garante que o modelo configurado esteja baixado localmente (persistido em ~/.ollama/models)
$installedModels = ollama list 2>$null
if ($installedModels -notmatch [regex]::Escape($OllamaModel)) {
    Write-Host "Baixando modelo $OllamaModel..." -ForegroundColor Yellow
    ollama pull $OllamaModel
} else {
    Write-Host "Modelo $OllamaModel já está persistido localmente." -ForegroundColor Green
}

# 3. Inicia Backend (FastAPI) e Frontend (Vite)
Write-Host "Iniciando Backend (http://127.0.0.1:8000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootDir\backend'; .\venv\Scripts\uvicorn.exe main:app --reload --host 127.0.0.1 --port 8000"

Write-Host "Iniciando Frontend (http://localhost:5173/Art-mis/)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootDir\frontend'; npm run dev"

Write-Host ""
Write-Host "Tudo iniciado! Acesse: http://localhost:5173/Art-mis/" -ForegroundColor Green
