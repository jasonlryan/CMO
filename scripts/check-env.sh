#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "==> Checking CMO Assessment Tool environment..."

# Check directories
echo -n "Checking directories... "
MISSING_DIRS=()
for dir in "frontend" "backend" "backend/ai/prompts" "backend/supabase" "docs"; do
    if [ ! -d "$dir" ]; then
        MISSING_DIRS+=($dir)
    fi
done

if [ ${#MISSING_DIRS[@]} -eq 0 ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}Missing: ${MISSING_DIRS[*]}${NC}"
    echo "Run: mkdir -p ${MISSING_DIRS[*]}"
fi

# Check virtual environment
echo -n "Checking virtual environment... "
if [ -d "venv" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}Missing${NC}"
    echo "Run setup.sh first"
    exit 1
fi

# Check frontend dependencies
echo -n "Checking frontend dependencies... "
if [ -f "frontend/package.json" ]; then
    MISSING_DEPS=()
    required_deps=("@supabase/supabase-js" "chart.js" "react-chartjs-2" "axios" "react" "react-dom")
    
    for dep in "${required_deps[@]}"; do
        if ! grep -q "\"$dep\":" frontend/package.json; then
            MISSING_DEPS+=($dep)
        fi
    done
    
    if [ ${#MISSING_DEPS[@]} -eq 0 ]; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${YELLOW}Missing: ${MISSING_DEPS[*]}${NC}"
        echo "Run: npm install ${MISSING_DEPS[*]}"
    fi
else
    echo -e "${RED}package.json not found${NC}"
    exit 1
fi

# Check .env file and required variables
echo -n "Checking .env file... "
if [ -f ".env" ]; then
    MISSING_VARS=()
    required_vars=("OPENAI_API_KEY" "SUPABASE_URL" "SUPABASE_KEY")
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" .env; then
            MISSING_VARS+=($var)
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -eq 0 ]; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${YELLOW}Missing variables: ${MISSING_VARS[*]}${NC}"
        echo "Add these variables to .env file"
    fi
else
    echo -e "${RED}Not found${NC}"
    echo "Create .env file with required variables"
    exit 1
fi

# Check backend main.py
echo -n "Checking backend/main.py... "
if [ -f "backend/main.py" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}Missing${NC}"
    exit 1
fi

# Check index.css exists
echo -n "Checking frontend/src/index.css... "
if [ -f "frontend/src/index.css" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}Missing index.css${NC}"
    echo "Creating basic index.css..."
    mkdir -p frontend/src
    touch frontend/src/index.css
fi

echo -e "\nEnvironment check complete!"

if [ ${#MISSING_DIRS[@]} -eq 0 ] && [ ${#MISSING_DEPS[@]} -eq 0 ] && [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo -e "${GREEN}All checks passed! You can run dev.sh${NC}"
else
    echo -e "${YELLOW}Please fix the issues above before running dev.sh${NC}"
fi 