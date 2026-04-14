# Deployment Guide

## Prerequisites

- Docker & Docker Compose v2+
- Domain name with DNS configured
- SSL certificate (Let's Encrypt recommended)

## Environment Variables

Copy `.env.example` to `.env` and configure all values:

```bash
cp .env.example .env
```

### Required Production Variables

| Variable | Description | Example |
|---|---|---|
| `SECRET_KEY` | Django secret key (generate with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`) | `your-random-secret-key` |
| `DEBUG` | Must be `False` in production | `False` |
| `ALLOWED_HOSTS` | Comma-separated domain names | `adawpt.ph,www.adawpt.ph` |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@db:5432/adawpt` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379/0` |
| `CORS_ALLOWED_ORIGINS` | Frontend URL | `https://adawpt.ph` |
| `JWT_SECRET` | Same secret used by Django and realtime service | `your-jwt-secret` |

## Production Docker Compose

```bash
# Build and start all services
docker compose -f docker-compose.yml up -d --build

# Run migrations
docker compose exec backend python manage.py migrate

# Create superuser
docker compose exec backend python manage.py createsuperuser

# Collect static files
docker compose exec backend python manage.py collectstatic --noinput
```

## Service Architecture

```
                    ┌─────────────┐
                    │   Nginx     │ :80/:443
                    │  (reverse   │
                    │   proxy)    │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────┴─────┐ ┌───┴───┐ ┌─────┴─────┐
        │  Frontend  │ │Backend│ │ Realtime  │
        │  (Vite)    │ │(Django│ │(Socket.IO)│
        │  :5173     │ │ :8000 │ │  :3001    │
        └────────────┘ └───┬───┘ └─────┬─────┘
                           │           │
                    ┌──────┴──────┐    │
                    │ PostgreSQL  │    │
                    │   :5432     │    │
                    └─────────────┘    │
                    ┌─────────────┐    │
                    │   Redis     ├────┘
                    │   :6379     │
                    └─────────────┘
                    ┌─────────────┐
                    │   Celery    │
                    │  (worker)   │
                    └─────────────┘
```

## Nginx Configuration

```nginx
upstream backend {
    server backend:8000;
}

upstream realtime {
    server realtime:3001;
}

server {
    listen 443 ssl http2;
    server_name adawpt.ph;

    ssl_certificate /etc/letsencrypt/live/adawpt.ph/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/adawpt.ph/privkey.pem;

    # Frontend (SPA)
    location / {
        root /var/www/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Django API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static & Media
    location /static/ {
        alias /var/www/backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/backend/media/;
    }

    # Socket.IO
    location /socket.io/ {
        proxy_pass http://realtime;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## Database Backup

```bash
# Backup
docker compose exec db pg_dump -U adawpt adawpt > backup_$(date +%Y%m%d).sql

# Restore
docker compose exec -T db psql -U adawpt adawpt < backup_20260407.sql
```

## Monitoring

- Health check endpoints:
  - Backend: `GET /api/v1/health/` (not yet implemented — returns Django admin)
  - Realtime: `GET :3001/health` (returns DB + Redis status)
- Logs: `docker compose logs -f [service_name]`

## Scaling

- **Celery workers**: Scale with `docker compose up -d --scale celery=3`
- **Backend**: Run multiple Gunicorn workers (configured in Dockerfile)
- **Realtime**: For multiple instances, use Socket.IO Redis adapter for sticky sessions

## Pre-deployment Checklist

- [ ] `DEBUG=False` in production
- [ ] `SECRET_KEY` is unique and secure
- [ ] `ALLOWED_HOSTS` contains only production domains
- [ ] CORS origins set to production frontend URL
- [ ] SSL certificate configured
- [ ] Database backups scheduled
- [ ] Static files collected
- [ ] Migrations applied
- [ ] Superuser created
- [ ] Media upload directory writable
- [ ] Celery worker running
- [ ] Redis accessible
