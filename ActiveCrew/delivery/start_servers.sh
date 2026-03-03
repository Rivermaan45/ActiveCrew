#!/bin/bash
# ActiveCrew v1 — Start Development Servers
# Backend: Express on port 3001
# Frontend: Vite on port 5173

set -e

cd "$(dirname "$0")/.."

echo "🚀 Starting ActiveCrew v1..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

echo "⚡ Starting servers..."
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:5173"
echo ""
echo "   API:      http://localhost:3001/api/sessions"
echo "   App:      http://localhost:5173"
echo ""

npm run dev
