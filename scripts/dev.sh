#!/usr/bin/env bash

# Exit on error
set -e

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Please run setup.sh first."
    exit 1
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "Missing .env file. Please create one with required variables:"
    echo "- OPENAI_API_KEY"
    echo "- SUPABASE_URL"
    echo "- SUPABASE_KEY"
    exit 1
fi

# Function to start frontend
start_frontend() {
    echo "Starting frontend..."
    cd frontend
    npm run dev &
    cd ..
}

# Function to start backend
start_backend() {
    echo "Starting backend..."
    source venv/bin/activate
    cd backend
    uvicorn main:app --reload --port 8000 &
    cd ..
}

# Function to cleanup processes on exit
cleanup() {
    echo "Shutting down servers..."
    pkill -f "npm run dev" || true
    pkill -f "uvicorn main:app" || true
}

# Register cleanup function to run on script exit
trap cleanup EXIT

# Start both servers
echo "==> Starting CMO Assessment Tool..."
start_frontend
start_backend

echo "==> Development servers running!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8000"
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
wait 