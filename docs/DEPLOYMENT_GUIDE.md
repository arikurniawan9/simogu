# Panduan Deployment Production & Docker SIMOGU

Dokumen ini berisi langkah-langkah deployment aplikasi **SIMOGU** pada server VPS Linux / Cloud Container menggunakan Docker Compose dan Nginx Reverse Proxy dengan SSL Let's Encrypt.

---

## 🚀 1. Menjalankan Server dengan Docker Compose

1. **Clone repository & siapkan `.env`**:
   ```bash
   git clone https://github.com/school/simogu.git /opt/simogu
   cd /opt/simogu
   ```

2. **Jalankan container produksi**:
   ```bash
   docker compose up -d --build
   ```

3. **Jalankan Database Migration & Seed Data Master**:
   ```bash
   docker exec -it simogu-api pnpm --filter @simogu/api prisma:migrate
   docker exec -it simogu-api pnpm --filter @simogu/api prisma:seed
   ```

---

## 🔒 2. Konfigurasi Reverse Proxy Nginx & SSL Certbot

Konfigurasi file `/etc/nginx/sites-available/simogu.conf`:

```nginx
server {
    server_name simogu.sch.id api.simogu.sch.id;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Jalankan Certbot SSL:
```bash
sudo certbot --nginx -d simogu.sch.id -d api.simogu.sch.id
```

---

## 💾 3. Backup & Restore Database PostgreSQL

- **Backup**:
  ```bash
  chmod +x scripts/backup-db.sh
  ./scripts/backup-db.sh
  ```

- **Restore**:
  ```bash
  gunzip -c backups/simogu_backup_XXXXXX.sql.gz | docker exec -i simogu-postgres psql -U simogu_user -d simogu_db
  ```
