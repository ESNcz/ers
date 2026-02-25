# ============================
# Base Stage
# ============================
FROM node:22-alpine AS base
RUN apk add --no-cache tzdata
ENV TZ=$TZ
RUN apk add --no-cache tzdata \
&& ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
&& echo $TZ > /etc/timezone

FROM base AS deps
# ============================
# Dependencies Stage
# ============================
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile;

FROM base AS builder
# ============================
# Builder Stage
# ============================
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_WEB_DOMAIN
ENV NEXT_PUBLIC_WEB_DOMAIN=$NEXT_PUBLIC_WEB_DOMAIN
ARG NEXT_PUBLIC_API_DOMAIN
ENV NEXT_PUBLIC_API_DOMAIN=$NEXT_PUBLIC_API_DOMAIN

RUN corepack enable pnpm && pnpm run build;

FROM base AS runner
# ============================
# Runner Stage
# ============================
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ARG PORT_FE
ARG NEXT_PUBLIC_WEB_DOMAIN
ENV NEXT_PUBLIC_WEB_DOMAIN=$NEXT_PUBLIC_WEB_DOMAIN
ARG NEXT_PUBLIC_API_DOMAIN
ENV NEXT_PUBLIC_API_DOMAIN=$NEXT_PUBLIC_API_DOMAIN

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE $PORT_FE

CMD ["node", "server.js"]