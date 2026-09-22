# Stage 1: Build do React com Node.js
FROM node:22-alpine AS builder

WORKDIR /app

# Instala dependências primeiro (aproveita cache de layers)
COPY package*.json ./
RUN npm install

# Copia o código e faz o build
COPY . .
RUN npm run build

# Stage 2: Serve o build estático com Nginx (muito mais leve que Node)
FROM nginx:alpine

# Copia o build para o diretório esperado pelo Nginx (/Art-mis/ = base do Vite)
COPY --from=builder /app/dist /usr/share/nginx/html/Art-mis

# Copia configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
