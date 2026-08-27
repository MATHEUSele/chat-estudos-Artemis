# Artemis 2.0 Makefile

# Variables
PYTHON = python
NPM = npm
FRONTEND_DIR = frontend
BACKEND_DIR = backend

.PHONY: setup-W setup-L run-W run-L build

# ==========================================
# WINDOWS COMMANDS
# ==========================================
setup-W:
	@echo "Configurando Backend (Windows)..."
	cd $(BACKEND_DIR) && $(PYTHON) -m venv venv && .\venv\Scripts\activate && pip install -r requirements.txt
	@echo "Configurando Frontend (Windows)..."
	cd $(FRONTEND_DIR) && $(NPM) install

run-W:
	@echo "Iniciando Backend e Frontend (Windows)..."
	start cmd /k "cd $(BACKEND_DIR) && .\venv\Scripts\activate && uvicorn main:app --reload"
	start cmd /k "cd $(FRONTEND_DIR) && $(NPM) run dev"

# ==========================================
# LINUX / MAC COMMANDS
# ==========================================
setup-L:
	@echo "Configurando Backend (Linux)..."
	cd $(BACKEND_DIR) && $(PYTHON)3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
	@echo "Configurando Frontend (Linux)..."
	cd $(FRONTEND_DIR) && $(NPM) install

run-L:
	@echo "Iniciando Backend e Frontend (Linux)..."
	# Starts backend in background, then frontend
	(cd $(BACKEND_DIR) && source venv/bin/activate && uvicorn main:app --reload) & \
	(cd $(FRONTEND_DIR) && $(NPM) run dev)

# ==========================================
# BUILD FOR GITHUB PAGES
# ==========================================
build:
	@echo "Gerando build estático do Frontend para GitHub Pages..."
	cd $(FRONTEND_DIR) && $(NPM) run build
	@echo "Build concluído! A pasta $(FRONTEND_DIR)/dist está pronta para o GitHub Pages."
