#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
cd /app/apps/api
npx prisma migrate deploy
echo "✅ Migrations complete"

echo "🚀 Starting SIMOGU API..."
cd /app
if [ -f apps/api/dist/src/main.js ]; then
  exec node apps/api/dist/src/main.js
else
  exec node apps/api/dist/main.js
fi
