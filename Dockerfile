FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-bookworm-slim AS landing-build
WORKDIR /app/landing
COPY landing/package*.json ./
RUN npm ci
COPY landing/ .
RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY --from=landing-build /app/landing/dist ./landing/dist

EXPOSE 3001
CMD ["node", "app.js"]
