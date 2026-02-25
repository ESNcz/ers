# ============================
# Builder Stage
# ============================
FROM node:22-alpine AS builder
ENV TZ=$TZ
RUN apk add --no-cache tzdata \
&& ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
&& echo $TZ > /etc/timezone

ARG PROJECT_NAME
ARG NODE_ENV
ARG WEB_DOMAIN
ENV NODE_ENV=$NODE_ENV
ENV WEB_DOMAIN=$WEB_DOMAIN
# Set working directory
WORKDIR /app

COPY . .

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN npm cache clean --force && rm -rf node_modules && pnpm install --frozen-lockfile --prod=false

# Build the NestJS project
RUN pnpm run build ${PROJECT_NAME}

# ============================
# Production Stage
# ============================
FROM node:22-alpine AS production

ARG PROJECT_NAME
ARG PORT_API
ARG NODE_ENV
ARG WEB_DOMAIN
ENV NODE_ENV=$NODE_ENV
ENV WEB_DOMAIN=$WEB_DOMAIN
ENV PROJECT_NAME=$PROJECT_NAME

ARG PROJECT_DIST="dist/apps/${PROJECT_NAME}"
# Set working directory
WORKDIR /app

RUN npm install -g pnpm

# Copy only the built application and necessary files from builder
COPY --from=builder /app/${PROJECT_DIST} .
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
# Copy e-mail templates
COPY --from=builder /app/templates/ ./templates/

# Install prod dependencies
RUN pnpm install --frozen-lockfile --prod=true
RUN apk add --no-cache curl

EXPOSE $PORT_API

# Start the server
ENTRYPOINT node main.js
