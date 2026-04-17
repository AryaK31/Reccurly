#!/bin/bash

# 🚀 Reccurly - Quick Start Script
# Run this to automatically set up and start the app

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Reccurly - Subscription Manager                   ║"
echo "║              Quick Setup & Run                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

PROJECT_ROOT="/Users/aryakharwadkar/Reccurly"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    echo "   Download from: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js $(node -v) detected"

# Check MongoDB
if ! command -v mongosh &> /dev/null; then
    echo "⚠️  MongoDB not found. Please install MongoDB Community Edition"
    echo "   macOS: brew install mongodb-community"
    echo "   Then start with: brew services start mongodb-community"
    exit 1
fi
echo "✅ MongoDB detected"

# Start MongoDB if not running
echo ""
echo "📦 Checking MongoDB service..."
if brew services list | grep -q "mongodb-community.*started"; then
    echo "✅ MongoDB is running"
else
    echo "🔄 Starting MongoDB..."
    brew services start mongodb-community
    sleep 2
    echo "✅ MongoDB started"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Setup Backend
echo ""
echo "🔧 Setting up Backend (Express + MongoDB)..."
cd "$PROJECT_ROOT/server"

if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install > /dev/null 2>&1
    echo "   ✅ Backend dependencies installed"
else
    echo "   ✅ Backend dependencies already installed"
fi

echo ""
echo "✨ Backend ready at: http://localhost:5500"
echo "   Starting backend server..."
echo ""
npm run dev &
BACKEND_PID=$!
echo "   📝 Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Setup Frontend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 Setting up Frontend (React Native + Expo)..."
cd "$PROJECT_ROOT"

if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install > /dev/null 2>&1
    echo "   ✅ Frontend dependencies installed"
else
    echo "   ✅ Frontend dependencies already installed"
fi

echo ""
echo "✨ Frontend ready!"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   🎉 ALL SET! 🎉                           ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║                                                            ║"
echo "║  Backend:  Running on port 5500 ✅                        ║"
echo "║  Database: MongoDB ready ✅                               ║"
echo "║  Frontend: Ready to start ✅                              ║"
echo "║                                                            ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  To start the Expo app, run in a NEW terminal:            ║"
echo "║                                                            ║"
echo "║  $ cd $PROJECT_ROOT                                       ║"
echo "║  $ npx expo start --lan                                   ║"
echo "║                                                            ║"
echo "║  Then scan the QR code with Expo Go on your phone         ║"
echo "║                                                            ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  📖 Documentation:                                         ║"
echo "║  - SETUP_AND_RUNNING.md  (Complete setup guide)          ║"
echo "║  - COMPLETION_SUMMARY.md (What was fixed)                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Keep script running
echo "✅ Backend is running (PID: $BACKEND_PID)"
echo "⏳ Press Ctrl+C to stop the backend when done testing"
echo ""

wait $BACKEND_PID
