# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.0

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages
COPY turbo.json tsconfig.base.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY apps/web ./apps/web

# Build (if production build exists)
# For dev mode, we skip build and serve directly
# RUN pnpm build --filter=@metaverse/web

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built files (or use dev server in development)
# For production, uncomment:
# COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# For development with Vite, we'll use a different approach
# This Dockerfile is for production builds
# For dev, use docker-compose.yml with node image

# Copy nginx config (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
