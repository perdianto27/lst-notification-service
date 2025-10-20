# ---- BASE STAGE ----
FROM node:22-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com

# ---- DEPENDENCY STAGE ----
FROM base AS deps
RUN npm ci --legacy-peer-deps

# ---- BUILD STAGE ----
FROM deps AS build
COPY . .

# Pastikan Prisma schema tersalin
RUN ls -R prisma || echo "⚠️ Prisma folder missing!"

# Generate Prisma Client
RUN npx prisma generate

# Build NestJS
RUN npm run build

# ---- PRODUCTION STAGE ----
FROM node:22-alpine AS prod
WORKDIR /usr/src/app

COPY package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma

RUN npx prisma generate

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/main.js"]