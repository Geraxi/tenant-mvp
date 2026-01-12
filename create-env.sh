#!/bin/bash
echo "Creating .env file..."
echo ""
echo "Enter your Supabase DATABASE_URL:"
echo "(Get it from: Supabase Dashboard → Settings → Database → Connection pooling)"
read -p "DATABASE_URL: " db_url
echo ""
echo "Enter your Supabase SERVICE_ROLE_KEY:"
echo "(Get it from: Supabase Dashboard → Settings → API → service_role)"
read -p "SUPABASE_SERVICE_ROLE_KEY: " service_key
echo ""
cat > .env << ENVFILE
DATABASE_URL=$db_url
SUPABASE_SERVICE_ROLE_KEY=$service_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=sb_publishable_RvrB-op5mh0qwzjaLL2OoQ_wUVI9Rp1
PORT=5000
NODE_ENV=development
ENVFILE
echo "✅ .env file created!"
echo ""
echo "Now start the server with: npm run dev"
