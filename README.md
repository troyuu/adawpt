# Adawpt — Stray Animal Rescue & Adoption System

A full-stack web application for managing stray animal rescue operations, shelter management, and pet adoption. Built for Philippine LGUs and NGOs.

## Features

- **Animal Reporting** — Citizens can report stray/abused animals with photos and location
- **Rescue Coordination** — Volunteers receive assignments and coordinate field rescues
- **Shelter Management** — Staff manage animal profiles, medical records, and care
- **Adoption Process** — Multi-step application with review workflow
- **Donations** — One-time, recurring, and animal sponsorship donations
- **Real-time Notifications** — WebSocket-based notification system
- **Dashboard & Analytics** — Role-based dashboards with statistics

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 6.0 + Django REST Framework 3.17 |
| Frontend | React 19 + Vite 8 + Tailwind CSS 4 |
| Database | PostgreSQL 18 |
| Cache/Queue | Redis 8 + Celery 5.6 |
| Realtime | Socket.IO 4.8 + Sequelize 6.37 |

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 24+ (for local frontend development)
- Python 3.13+ (for local backend development)

### Setup

1. Clone the repository:
```bash
git clone <repo-url> adawpt
cd adawpt
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Start all services:
```bash
docker compose up --build
```

4. Run migrations:
```bash
docker compose exec backend python manage.py migrate
```

5. Create admin user:
```bash
docker compose exec backend python manage.py createsuperuser
```

6. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/v1/
- API Docs: http://localhost:8000/api/docs/
- Django Admin: http://localhost:8000/admin/
- Realtime Service: http://localhost:3001

## Development

### Backend
```bash
cd backend
pip install -r requirements/dev.txt
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Realtime Service
```bash
cd realtime
npm install
npm start
```

### Running Tests
```bash
# Backend
pytest backend/ --cov

# Frontend
cd frontend && npm test
```

## Documentation

- [Requirements](docs/requirements.md) — Feature specification
- [Database Schema](docs/database-schema.md) — Tables and relationships
- [Architecture](docs/architecture.md) — System design
- [UI Design](docs/ui-design.md) — Design system
- [API Endpoints](docs/api-endpoints.md) — REST API reference
- [Folder Structure](docs/folder-structure.md) — Project organization

## License

MIT
