# Build stage
FROM --platform=linux/amd64 node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Production stage
FROM --platform=linux/amd64 node:18-alpine

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/backend ./backend

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV OPENAI_API_KEY=""
ENV ENABLE_CHATGPT_ENDPOINT=true

# Expose port
EXPOSE 8080

# Start the simplified ChatGPT-only server
ENTRYPOINT []
CMD ["node", "backend/chatgpt-server.js"] 