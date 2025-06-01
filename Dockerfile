# Simplified Dockerfile for debugging
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json .
COPY package-lock.json .

# List files to verify they were copied correctly
RUN ls -la

# Try installing with regular npm install instead of npm ci
RUN npm install --production

# Copy application files
COPY backend ./backend

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV ENABLE_CHATGPT_ENDPOINT=true

# Install additional packages
RUN npm install compression @google-cloud/logging

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "backend/chatgpt-server.js"] 