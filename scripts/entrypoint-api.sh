#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
cd /app/apps/api
npx prisma migrate deploy
echo "✅ Migrations complete"

echo "🌱 Checking database seeding..."
if [ -f /app/apps/api/dist/prisma/seed.js ]; then
  node /app/apps/api/dist/prisma/seed.js || echo "⚠️ Seeding skipped or already initialized"
fi

echo "🚀 Starting SIMOGU API..."
cd /app
if [ -f apps/api/dist/src/main.js ]; then
  exec node apps/api/dist/src/main.js
else
  exec node apps/api/dist/main.js
fi

