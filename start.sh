#!/bin/bash
# Mission Control - Startup Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

echo "🖥️  Mission Control - Starting..."
echo ""

# Check Node version
NODE_VERSION=$(node -v 2>/dev/null)
if [ -z "$NODE_VERSION" ]; then
    echo "❌ Node.js not found. Please install Node.js 14+."
    exit 1
fi
echo "✓ Node.js: $NODE_VERSION"

# Check if port is available
PORT=${MC_PORT:-3001}
if lsof -i :$PORT >/dev/null 2>&1; then
    echo "⚠️  Port $PORT is already in use"
    read -p "Kill existing process? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti :$PORT | xargs kill -9 2>/dev/null
        echo "✓ Killed existing process on port $PORT"
    else
        echo "❌ Cannot start. Please free up port $PORT or set MC_PORT environment variable."
        exit 1
    fi
fi

# Create logs directory if needed
mkdir -p "$SCRIPT_DIR/logs"
mkdir -p "$SCRIPT_DIR/config"

# Set environment
export WORKSPACE="${WORKSPACE:-/Users/sam/.openclaw/workspace}"
export OPENCLAW_LOG="${OPENCLAW_LOG:-$WORKSPACE/../gateway.log}"

echo "✓ Workspace: $WORKSPACE"
echo "✓ Logs directory: $SCRIPT_DIR/logs"
echo ""
echo "🚀 Starting Mission Control server..."
echo "   Dashboard: http://localhost:$PORT/logs/dashboard.html"
echo "   API:       http://localhost:$PORT/api/"
echo "   SSE:       ws://localhost:$PORT/sse/logs"
echo ""
echo "Press Ctrl+C to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start server with integration layer
if [ "$1" = "--integration" ]; then
    # Run both server and integration layer
    node integration.js &
    INTEGRATION_PID=$!
    
    # Wait for integration to initialize
    sleep 2
    
    node server.js
    
    # Cleanup on exit
    kill $INTEGRATION_PID 2>/dev/null
else
    # Run server only
    node server.js
fi
