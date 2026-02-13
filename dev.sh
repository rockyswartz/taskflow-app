#!/bin/bash

# This script helps with local development by serving the application
# and attempting to bypass common SSL/TLS verification issues 
# that can occur in some development environments.

echo "🚀 Starting TaskFlow Dev Server..."
echo "📍 URL: http://localhost:8000"

# Set Node environment flag to ignore self-signed certificates in the toolchain
export NODE_TLS_REJECT_UNAUTHORIZED=0

# Use Python's built-in server as a simple default
# If you prefer Node, you can replace this with 'npx serve' or 'live-server'
if command -v python3 &>/dev/null; then
    python3 -m http.server 8000
else
    # Fallback to Node.js if python is not available
    npx -y serve -l 8000
fi
