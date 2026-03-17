#!/bin/bash

# TravelMind — Start both servers
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "✈️  Starting TravelMind..."
echo ""

# Start Express backend in background
echo "🚀 Starting backend (port 3001)..."
cd "$DIR/server" && node server.js &
BACKEND_PID=$!

# Start React frontend
echo "🌐 Starting frontend (port 5173)..."
cd "$DIR/client" && npx vite &
FRONTEND_PID=$!

echo ""
echo "📡 Backend:  http://localhost:3001"
echo "🖥️  Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers."

# Kill both on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo '👋 Stopped.'; exit" SIGINT SIGTERM
wait
