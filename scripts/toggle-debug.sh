#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ENV_FILE=".env"

# Check if .env exists
if [ ! -f $ENV_FILE ]; then
    echo -e "${YELLOW}Error: .env file not found${NC}"
    exit 1
fi

# Read current DEBUG_MODE value
current_value=$(grep "^DEBUG_MODE=" $ENV_FILE | cut -d '=' -f2)

# Toggle the value
if [ "$current_value" = "true" ]; then
    new_value="false"
else
    new_value="true"
fi

# Update .env file
sed -i.bak "s/^DEBUG_MODE=.*/DEBUG_MODE=$new_value/" $ENV_FILE
rm "${ENV_FILE}.bak"

echo -e "${GREEN}Debug mode is now: $new_value${NC}" 