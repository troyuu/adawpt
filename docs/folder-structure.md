# Adawpt — Folder Structure

## Monorepo Overview

```
adawpt/
├── docs/                           # Planning & specification documents
│   ├── requirements.md             # Full feature specification
│   ├── database-schema.md          # Database tables & ER diagram
│   ├── architecture.md             # System architecture & patterns
│   ├── ui-design.md                # Design system & component specs
│   ├── folder-structure.md         # This file
│   ├── api-endpoints.md            # REST API endpoint reference
│   └── deployment.md               # Production deployment guide
│
├── backend/                        # Django REST API service
│   ├── Dockerfile                  # Python 3.13 container
│   ├── manage.py                   # Django management command
│   ├── requirements/               # Split pip requirements
│   │   ├── base.txt                # Production dependencies
│   │   └── dev.txt                 # Development & testing dependencies
│   ├── config/                     # Django project configuration
│   │   ├── __init__.py
│   │   ├── asgi.py                 # ASGI application
│   │   ├── wsgi.py                 # WSGI application
│   │   ├── urls.py                 # Root URL configuration
│   │   ├── celery.py               # Celery app configuration
│   │   └── settings/               # Split settings
│   │       ├── __init__.py         # Loads from DJANGO_SETTINGS_MODULE
│   │       ├── base.py             # Shared settings
│   │       ├── dev.py              # Development overrides
│   │       └── prod.py             # Production overrides
│   ├── apps/                       # Django applications
│   │   ├── core/                   # Shared utilities
│   │   │   ├── __init__.py
│   │   │   ├── models.py           # TimestampedModel (abstract base)
│   │   │   ├── permissions.py      # Custom permission classes
│   │   │   ├── pagination.py       # StandardPagination
│   │   │   ├── exceptions.py       # Custom exception handler
│   │   │   ├── renderers.py        # StandardJSONRenderer
│   │   │   ├── utils.py            # File upload helpers
│   │   │   └── middleware.py       # Audit trail middleware
│   │   ├── accounts/               # Authentication & user management
│   │   │   ├── __init__.py
│   │   │   ├── admin.py            # Custom User admin
│   │   │   ├── apps.py             # App configuration
│   │   │   ├── managers.py         # CustomUserManager
│   │   │   ├── models.py           # Custom User model
│   │   │   ├── serializers.py      # Auth & user serializers
│   │   │   ├── signals.py          # User signals (welcome notification)
│   │   │   ├── urls.py             # Auth URL patterns
│   │   │   ├── views.py            # Auth & profile views
│   │   │   └── tests/
│   │   │       ├── __init__.py
│   │   │       ├── test_models.py
│   │   │       ├── test_serializers.py
│   │   │       └── test_views.py
│   │   ├── animals/                # Animal profiles & shelter management
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── filters.py          # AnimalFilter (django-filter)
│   │   │   ├── models.py           # Animal, AnimalImage, MedicalRecord
│   │   │   ├── serializers.py
│   │   │   ├── signals.py
│   │   │   ├── tasks.py            # Celery image processing tasks
│   │   │   ├── urls.py
│   │   │   ├── views.py            # AnimalViewSet + nested viewsets
│   │   │   └── tests/
│   │   │       ├── __init__.py
│   │   │       ├── test_models.py
│   │   │       ├── test_serializers.py
│   │   │       └── test_views.py
│   │   ├── reports/                # Animal reporting & rescue ops
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── filters.py
│   │   │   ├── models.py           # AnimalReport, ReportImage
│   │   │   ├── serializers.py
│   │   │   ├── signals.py          # Notification on new report
│   │   │   ├── urls.py
│   │   │   ├── views.py
│   │   │   └── tests/
│   │   │       ├── __init__.py
│   │   │       ├── test_models.py
│   │   │       ├── test_serializers.py
│   │   │       └── test_views.py
│   │   ├── adoptions/              # Adoption applications & workflow
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── models.py           # AdoptionApplication
│   │   │   ├── serializers.py
│   │   │   ├── signals.py          # Auto-update animal status
│   │   │   ├── urls.py
│   │   │   ├── views.py
│   │   │   └── tests/
│   │   │       ├── __init__.py
│   │   │       ├── test_models.py
│   │   │       ├── test_serializers.py
│   │   │       └── test_views.py
│   │   ├── donations/              # Donations & sponsorships
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── models.py           # Donation
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   ├── views.py
│   │   │   └── tests/
│   │   │       ├── __init__.py
│   │   │       ├── test_models.py
│   │   │       └── test_views.py
│   │   ├── notifications/          # In-app notification system
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── models.py           # Notification
│   │   │   ├── serializers.py
│   │   │   ├── services.py         # create_notification() + Redis pub
│   │   │   ├── urls.py
│   │   │   ├── views.py
│   │   │   └── tests/
│   │   │       ├── __init__.py
│   │   │       └── test_views.py
│   │   └── content/                # Success stories & events
│   │       ├── __init__.py
│   │       ├── admin.py
│   │       ├── apps.py
│   │       ├── models.py           # SuccessStory, Event
│   │       ├── serializers.py
│   │       ├── urls.py
│   │       ├── views.py
│   │       └── tests/
│   │           ├── __init__.py
│   │           └── test_views.py
│   ├── media/                      # Uploaded files (gitignored)
│   └── static/                     # Collected static files (gitignored)
│
├── frontend/                       # React SPA (Vite)
│   ├── Dockerfile                  # Node 24 container
│   ├── package.json                # Dependencies & scripts
│   ├── vite.config.js              # Vite 8 + React + Tailwind CSS
│   ├── index.html                  # SPA entry point
│   ├── public/                     # Static public assets
│   │   └── favicon.svg
│   └── src/
│       ├── main.jsx                # React root render
│       ├── app.jsx                 # App component with RouterProvider
│       ├── app.css                 # Tailwind v4 imports + @theme
│       ├── router.jsx              # createBrowserRouter routes
│       ├── api/                    # API client layer
│       │   ├── client.js           # Axios instance + JWT interceptors
│       │   └── endpoints/
│       │       ├── auth.js
│       │       ├── animals.js
│       │       ├── reports.js
│       │       ├── adoptions.js
│       │       ├── donations.js
│       │       ├── notifications.js
│       │       └── content.js
│       ├── auth/                   # Authentication
│       │   ├── AuthContext.jsx      # Auth context provider
│       │   ├── useAuth.js          # Auth hook
│       │   ├── ProtectedRoute.jsx  # Route guard
│       │   └── RoleGuard.jsx       # Role-based guard
│       ├── components/
│       │   ├── ui/                 # Reusable UI primitives
│       │   │   ├── Button.jsx
│       │   │   ├── Input.jsx
│       │   │   ├── Select.jsx
│       │   │   ├── Textarea.jsx
│       │   │   ├── Card.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── Badge.jsx
│       │   │   ├── Alert.jsx
│       │   │   ├── Avatar.jsx
│       │   │   ├── Spinner.jsx
│       │   │   ├── Skeleton.jsx
│       │   │   ├── EmptyState.jsx
│       │   │   ├── Pagination.jsx
│       │   │   ├── Dropdown.jsx
│       │   │   ├── Tabs.jsx
│       │   │   ├── FileUpload.jsx
│       │   │   ├── StatusBadge.jsx
│       │   │   └── Toast.jsx
│       │   └── layout/            # Layout components
│       │       ├── PublicLayout.jsx
│       │       ├── DashboardLayout.jsx
│       │       ├── Navbar.jsx
│       │       ├── Sidebar.jsx
│       │       ├── Footer.jsx
│       │       └── MobileMenu.jsx
│       ├── pages/
│       │   ├── public/            # Public-facing pages
│       │   │   ├── LandingPage.jsx
│       │   │   ├── AnimalListPage.jsx
│       │   │   ├── AnimalDetailPage.jsx
│       │   │   ├── ReportPage.jsx
│       │   │   ├── ReportConfirmation.jsx
│       │   │   ├── DonationPage.jsx
│       │   │   ├── StoriesPage.jsx
│       │   │   ├── StoryDetailPage.jsx
│       │   │   ├── EventsPage.jsx
│       │   │   └── EventDetailPage.jsx
│       │   ├── auth/              # Authentication pages
│       │   │   ├── LoginPage.jsx
│       │   │   ├── RegisterPage.jsx
│       │   │   ├── ForgotPasswordPage.jsx
│       │   │   └── VerifyEmailPage.jsx
│       │   └── dashboard/         # Dashboard pages
│       │       ├── DashboardHome.jsx
│       │       ├── AnimalsManagement.jsx
│       │       ├── ReportsManagement.jsx
│       │       ├── AdoptionsManagement.jsx
│       │       ├── DonationsManagement.jsx
│       │       ├── UsersManagement.jsx
│       │       ├── ContentManagement.jsx
│       │       ├── NotificationsPage.jsx
│       │       ├── MyApplications.jsx
│       │       ├── MyAdoptedAnimals.jsx
│       │       ├── VolunteerMissions.jsx
│       │       ├── ProfilePage.jsx
│       │       └── SettingsPage.jsx
│       ├── hooks/                 # Custom React hooks
│       │   ├── useApi.js
│       │   ├── useDebounce.js
│       │   ├── usePagination.js
│       │   ├── useNotifications.js
│       │   └── useMediaQuery.js
│       └── lib/                   # Utilities
│           ├── constants.js
│           ├── utils.js
│           └── validators.js
│
├── realtime/                       # Socket.IO real-time service
│   ├── Dockerfile                  # Node 24 container
│   ├── package.json
│   └── src/
│       ├── index.js                # Express + Socket.IO server
│       ├── config/
│       │   ├── database.js         # Sequelize connection
│       │   └── redis.js            # ioredis client
│       ├── middleware/
│       │   └── auth.js             # JWT verification
│       ├── models/
│       │   └── Notification.js     # Sequelize Notification model
│       ├── services/
│       │   ├── notification.js     # Redis pub/sub → Socket.IO
│       │   └── connection.js       # Socket connection management
│       └── events/
│           └── handlers.js         # Socket event handlers
│
├── .claude/                        # Claude Code configuration
│   ├── agents/                     # Specialized agent definitions
│   ├── commands/                   # Slash command definitions
│   └── skills/                     # Skill definitions
│
├── docker-compose.yml              # Multi-service orchestration
├── .gitignore                      # Git ignore patterns
├── .env.example                    # Environment variable template
├── CLAUDE.md                       # Project-level Claude instructions
└── README.md                       # Project overview & setup guide
```

---

## Directory Conventions

### Backend (Python/Django)
- One Django app per domain module in `backend/apps/`
- Each app has `models.py`, `serializers.py`, `views.py`, `urls.py`, `admin.py`
- Tests in `tests/` subdirectory per app
- Shared code in `backend/apps/core/`
- Settings split: `base.py` (shared), `dev.py` (local), `prod.py` (production)

### Frontend (React/Vite)
- Components in `src/components/` — `ui/` for primitives, `layout/` for structural
- Pages in `src/pages/` — grouped by context (public, auth, dashboard)
- API layer in `src/api/` — `client.js` for Axios config, `endpoints/` for per-module functions
- Auth logic isolated in `src/auth/`
- Custom hooks in `src/hooks/`
- Utilities and constants in `src/lib/`

### Realtime (Node.js/Socket.IO)
- Flat structure under `src/`
- `config/` for database and Redis connections
- `middleware/` for Socket.IO middleware
- `models/` for Sequelize models
- `services/` for business logic
- `events/` for Socket.IO event handlers

### Naming Conventions
| Context | Convention | Example |
|---|---|---|
| Python files | snake_case | `animal_report.py` |
| Python classes | PascalCase | `AnimalReport` |
| JavaScript files | PascalCase (components) | `AnimalCard.jsx` |
| JavaScript files | camelCase (utilities) | `useAuth.js` |
| CSS classes | Tailwind utility classes | `bg-primary text-white` |
| Database tables | snake_case plural | `animal_reports` |
| API URLs | kebab-case | `/api/v1/animal-reports/` |
| Environment vars | UPPER_SNAKE_CASE | `DATABASE_URL` |
