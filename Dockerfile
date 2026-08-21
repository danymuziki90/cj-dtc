# Dockerfile for production
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json* ./
COPY prisma ./prisma
# Provide a dummy DATABASE_URL so Prisma schema validation passes during build
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npm ci --prefer-offline --no-audit
COPY . .
RUN npm run build:docker

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
EXPOSE 3000
CMD ["node", "server.js"]
