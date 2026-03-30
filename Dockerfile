# =============================================================================
# Multi-stage build: build static site, then serve with Caddy
# =============================================================================

# --- Build stage ---
FROM node:22-slim AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# --- Production stage ---
# For VPS deployment, we rsync dist/ to /var/www/inferops.dev and serve via Caddy.
# This stage is only needed if you want a fully containerized site (optional).
FROM caddy:2-alpine AS runtime
COPY --from=build /app/dist /var/www/inferops.dev
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80 443
