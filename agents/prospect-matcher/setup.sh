#!/bin/bash

# ProspectMatcher Agent Setup Script
# This script helps you get the agent up and running quickly

set -e

echo "🚀 ProspectMatcher Agent Setup"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check for package manager
if command -v bun &> /dev/null; then
    PACKAGE_MANAGER="bun"
    echo "✅ Using Bun as package manager"
elif command -v npm &> /dev/null; then
    PACKAGE_MANAGER="npm"
    echo "✅ Using npm as package manager"
else
    echo "❌ No package manager found. Please install npm or bun."
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
$PACKAGE_MANAGER install

echo ""
echo "⚙️  Setting up environment..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo ""
    echo "📝 Please edit .env and add your credentials:"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - OPENAI_API_KEY"
    echo ""

    # Try to open .env in default editor
    if command -v code &> /dev/null; then
        echo "Opening .env in VS Code..."
        code .env
    elif command -v nano &> /dev/null; then
        read -p "Press Enter to edit .env with nano, or Ctrl+C to exit and edit manually..."
        nano .env
    else
        echo "Please edit .env manually with your preferred text editor"
    fi
else
    echo "⚠️  .env file already exists. Skipping..."
fi

echo ""
echo "📋 Next steps:"
echo ""
echo "1. Ensure your .env file has valid credentials:"
echo "   - SUPABASE_SERVICE_ROLE_KEY (from Supabase Dashboard > Settings > API)"
echo "   - OPENAI_API_KEY (from https://platform.openai.com/api-keys)"
echo ""
echo "2. Run the database setup script in Supabase SQL Editor:"
echo "   cat setup-agent.sql"
echo ""
echo "3. Start the development server:"
echo "   $PACKAGE_MANAGER run dev"
echo ""
echo "4. Test the agent:"
echo "   curl http://localhost:3001/health"
echo ""
echo "5. Read QUICKSTART.md for example usage"
echo ""
echo "✨ Setup complete! Happy matching!"
