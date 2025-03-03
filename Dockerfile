# Build stage
FROM --platform=linux/amd64 node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json ./
COPY package-lock.json ./

# Install dependencies with production flag
RUN npm ci --only=production

# Copy application files
COPY backend ./backend

# Production stage
FROM --platform=linux/amd64 node:18-alpine AS production

# Set working directory
WORKDIR /app

# Set Node.js optimization flags
ENV NODE_ENV=production
ENV PORT=8080
ENV OPENAI_API_KEY=""
ENV ENABLE_CHATGPT_ENDPOINT=true
ENV ENABLE_CLOUD_LOGGING=true
ENV NODE_OPTIONS="--max-old-space-size=2048 --optimize-for-size"

# Copy only necessary files from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/backend ./backend

# Install only the compression package for response optimization
# and Google Cloud Logging for performance monitoring
RUN npm install compression @google-cloud/logging

# Expose port
EXPOSE 8080

# Use a non-root user for better security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Set health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD [ "node", "-e", "require('http').get('http://localhost:8080/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))" ]

# Start the simplified ChatGPT-only server
ENTRYPOINT []
CMD ["node", "backend/chatgpt-server.js"] 