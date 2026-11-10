# ==============================================================================
# Etapa 1: Build (Compilación de TypeScript con Node.js)
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./

RUN npm ci

COPY src/ ./src/

RUN npm run build

# ==============================================================================
# Etapa 2: Runtime (Imagen de ejecución final de producción)
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/swagger/swagger.json ./dist/swagger/swagger.json

EXPOSE 5608 5631 3000

CMD ["node", "dist/server.js"]

