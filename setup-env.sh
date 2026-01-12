#!/bin/bash

echo "=========================================="
echo "Tenant App - Environment Setup"
echo "=========================================="
echo ""
echo "This script will help you set up the required environment variables."
echo ""

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [[ ! $overwrite =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env file."
        exit 0
    fi
fi

echo "You'll need to get these from your Supabase dashboard:"
echo "1. DATABASE_URL - PostgreSQL connection string"
echo "2. SUPABASE_SERVICE_ROLE_KEY - Service role key"
echo ""
echo "Let's set them up:"
echo ""

# Get DATABASE_URL
echo "📊 DATABASE_URL"
echo "   Go to: Supabase Dashboard → Settings → Database → Connection string"
echo "   Copy the 'Connection pooling' URI (starts with postgresql://)"
read -p "Paste your DATABASE_URL: " db_url

if [ -z "$db_url" ]; then
    echo "❌ DATABASE_URL is required!"
    exit 1
fi

# Get SUPABASE_SERVICE_ROLE_KEY
echo ""
echo "🔑 SUPABASE_SERVICE_ROLE_KEY"
echo "   Go to: Supabase Dashboard → Settings → API"
echo "   Copy the 'service_role' key (keep it secret!)"
read -p "Paste your SUPABASE_SERVICE_ROLE_KEY: " service_key

if [ -z "$service_key" ]; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY is required!"
    exit 1
fi

# Create .env file
cat > .env << EOF
# Database
DATABASE_URL=$db_url

# Supabase
SUPABASE_URL=https://iohszsmnkbxpauqqdudy.supabase.co
SUPABASE_ANON_KEY=sb_publishable_RvrB-op5mh0qwzjaLL2OoQ_wUVI9Rp1
SUPABASE_SERVICE_ROLE_KEY=$service_key

# Server
PORT=5000
NODE_ENV=development
EOF

echo ""
echo "✅ .env file created successfully!"
echo ""
echo "Now you can start the server with:"
echo "  npm run dev"
echo ""




