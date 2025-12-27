# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser

# Copy package files and install production dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production

# Generate Prisma client for production
RUN npx prisma generate

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Change ownership to non-root user
RUN chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/api/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]
