#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
cd /app/apps/api
npx prisma migrate deploy
echo "✅ Migrations complete"

echo "🚀 Starting SIMOGU API..."
cd /app
exec node apps/api/dist/main.js
