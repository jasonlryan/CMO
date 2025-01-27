#!/usr/bin/env bash

# Exit on error
set -e

echo "==> Setting up CMO Assessment Tool..."

# Function to safely create directory
safe_mkdir() {
    if [ ! -d "$1" ]; then
        echo "Creating directory: $1"
        mkdir -p "$1"
    else
        echo "Directory already exists: $1"
    fi
}

# Create necessary directories if they don't exist
safe_mkdir frontend
safe_mkdir backend/ai/prompts
safe_mkdir backend/supabase
safe_mkdir docs

# Frontend setup
echo "==> Checking Frontend Setup..."
cd frontend
if [ ! -f package.json ]; then
    echo "Initializing new frontend..."
    npm init -y
    npm install react react-dom @vitejs/plugin-react vite axios@^1.7.9 @supabase/supabase-js chart.js@^4.4.7 react-chartjs-2@^5.3.0
else
    echo "Frontend already initialized. Checking dependencies..."
    npm install
fi

# Create vite config if it doesn't exist
if [ ! -f vite.config.js ]; then
    echo "Creating vite config..."
    echo 'import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});' > vite.config.js
fi

echo "Creating frontend directory structure..."
mkdir -p src/{components,pages,contexts,hooks,lib,types}
mkdir -p src/components/{assessment,common}
mkdir -p src/pages/{Dashboard,Assessment,Reports}
cd ..

# Backend setup
echo "==> Checking Backend Setup..."
if [ ! -d "venv" ]; then
    echo "Creating new virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

# Install/upgrade pip packages
echo "Installing/upgrading Python packages..."
pip install --upgrade pip
pip install fastapi uvicorn python-dotenv openai supabase pytest

# Update requirements.txt
echo "Updating requirements.txt..."
pip freeze > backend/requirements.txt

# Environment setup
if [ ! -f ".env" ]; then
    echo "Creating new .env file..."
    cat > .env << EOL
OPENAI_API_KEY=your_key_here
SUPABASE_URL=your_url_here
SUPABASE_KEY=your_key_here
EOL
    echo "Please update .env with your API keys"
else
    echo ".env file already exists. Please verify it contains required variables:"
    echo "- OPENAI_API_KEY"
    echo "- SUPABASE_URL"
    echo "- SUPABASE_KEY"
fi

echo "==> Setup complete!"
echo "To start frontend: cd frontend && npm run dev"
echo "To start backend: cd backend && uvicorn main:app --reload" 