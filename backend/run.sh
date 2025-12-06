#!/bin/bash

# Finance OCR Backend Startup Script

echo "🚀 Starting Finance OCR Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "📦 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "📝 Please create a .env file with your configuration."
    echo "   See README.md for instructions."
    exit 1
fi

# Start the server
echo "✅ Starting FastAPI server..."
echo "📍 API: http://localhost:8000"
echo "📚 Docs: http://localhost:8000/api/docs"
echo "🔍 Health: http://localhost:8000/api/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python main.py

