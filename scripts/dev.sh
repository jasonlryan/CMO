#!/usr/bin/env bash

# Exit on error
set -e

# Check for .env file
if [ ! -f ".env" ]; then
    echo "Missing .env file. Please create one with required variables:"
    echo "- OPENAI_API_KEY"
    echo "- SUPABASE_PROJECT_URL"
    echo "- SUPABASE_ANON_KEY"
    exit 1
fi

# Function to start backend
start_backend() {
    echo "Starting backend..."
    cd backend
    npm run start:backend &
    cd ..
} 