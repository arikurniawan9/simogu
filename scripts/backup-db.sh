#!/bin/bash
# Backup Script PostgreSQL SIMOGU
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
BACKUP_FILE="${BACKUP_DIR}/simogu_backup_${TIMESTAMP}.sql.gz"

mkdir -p ${BACKUP_DIR}

echo "📦 Memulai backup database SIMOGU ke ${BACKUP_FILE}..."
docker exec -t simogu-postgres pg_dump -U simogu_user simogu_db | gzip > ${BACKUP_FILE}

if [ $? -eq 0 ]; then
  echo "✅ Backup database berhasil dibuat: ${BACKUP_FILE}"
else
  echo "❌ Backup database gagal!"
  exit 1
fi
