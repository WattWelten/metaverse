# Multi-stage build for production
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY apps/server/package.json ./apps/server/
COPY packages/*/package.json ./packages/*/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile --filter ./apps/server

# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY apps/server/package.json ./apps/server/
COPY packages/*/package.json ./packages/*/

# Install pnpm
RUN npm install -g pnpm

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source files
COPY apps/server ./apps/server
COPY packages ./packages
COPY turbo.json ./

# Build server
RUN pnpm --filter ./apps/server build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY apps/server/package.json ./apps/server/

# Install pnpm
RUN npm install -g pnpm

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod --filter ./apps/server

# Copy built files from build stage
COPY --from=build --chown=nodejs:nodejs /app/apps/server/dist ./apps/server/dist

# Copy workspace packages if needed
COPY --from=build --chown=nodejs:nodejs /app/packages ./packages

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
WORKDIR /app/apps/server
CMD ["node", "dist/server.js"]













