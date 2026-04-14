# Adawpt — API Endpoints Reference

## Base URL
```
/api/v1/
```

## Authentication
All protected endpoints require:
```
Authorization: Bearer <access_token>
```

## Response Format
All responses use the standard envelope:
```json
{
  "success": true|false,
  "data": { ... } | null,
  "message": "string",
  "errors": { ... } | null
}
```

---

## 1. Authentication (`/api/v1/auth/`)

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| POST | `/auth/register/` | No | — | Register new user |
| POST | `/auth/login/` | No | — | Login, returns JWT tokens |
| POST | `/auth/token/refresh/` | No | — | Refresh access token |
| POST | `/auth/logout/` | Yes | Any | Blacklist refresh token |
| GET | `/auth/me/` | Yes | Any | Get current user profile |
| PATCH | `/auth/me/` | Yes | Any | Update current user profile |
| POST | `/auth/change-password/` | Yes | Any | Change password |

### Register
```
POST /api/v1/auth/register/

Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "role": "adopter"  // adopter | volunteer | reporter
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "Juan",
    "last_name": "Dela Cruz",
    "role": "adopter",
    "tokens": {
      "access": "eyJ...",
      "refresh": "eyJ..."
    }
  },
  "message": "Registration successful"
}
```

### Login
```
POST /api/v1/auth/login/

Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "Juan",
    "last_name": "Dela Cruz",
    "role": "adopter",
    "tokens": {
      "access": "eyJ...",
      "refresh": "eyJ..."
    }
  },
  "message": "Login successful"
}
```

### Get Profile
```
GET /api/v1/auth/me/

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "Juan",
    "last_name": "Dela Cruz",
    "role": "adopter",
    "phone": "+639123456789",
    "address": "Quezon City, Metro Manila",
    "avatar": "/media/avatars/uuid/photo.jpg",
    "email_verified": true,
    "date_joined": "2025-01-15T08:00:00Z"
  }
}
```

---

## 2. Animals (`/api/v1/animals/`)

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/animals/` | No | — | List animals (public) |
| POST | `/animals/` | Yes | Admin, Staff | Create animal profile |
| GET | `/animals/{id}/` | No | — | Get animal detail |
| PATCH | `/animals/{id}/` | Yes | Admin, Staff | Update animal |
| DELETE | `/animals/{id}/` | Yes | Admin | Delete animal |
| GET | `/animals/{id}/images/` | No | — | List animal images |
| POST | `/animals/{id}/images/` | Yes | Admin, Staff | Upload animal image |
| DELETE | `/animals/{id}/images/{img_id}/` | Yes | Admin, Staff | Delete image |
| GET | `/animals/{id}/medical-records/` | Yes | Admin, Staff | List medical records |
| POST | `/animals/{id}/medical-records/` | Yes | Admin, Staff | Add medical record |

### List Animals
```
GET /api/v1/animals/?species=dog&status=available&gender=female&search=golden&ordering=-created_at&page=1

Response (200):
{
  "success": true,
  "data": {
    "count": 45,
    "next": "/api/v1/animals/?page=2",
    "previous": null,
    "results": [
      {
        "id": "uuid",
        "name": "Bantay",
        "species": "dog",
        "breed": "Aspin Mix",
        "age_years": 2,
        "age_months": 6,
        "gender": "male",
        "weight_kg": 12.5,
        "status": "available",
        "primary_image": "/media/animals/uuid/photo.jpg",
        "is_vaccinated": true,
        "is_spayed_neutered": true,
        "created_at": "2025-01-15T08:00:00Z"
      }
    ]
  }
}
```

### Create Animal
```
POST /api/v1/animals/

Request (multipart/form-data):
{
  "name": "Bantay",
  "species": "dog",
  "breed": "Aspin Mix",
  "age_years": 2,
  "age_months": 6,
  "gender": "male",
  "weight_kg": 12.5,
  "color": "Brown and white",
  "description": "Friendly and playful dog found in Quezon City",
  "temperament": "friendly, playful, good with kids",
  "special_needs": null,
  "is_spayed_neutered": true,
  "is_vaccinated": true,
  "is_good_with_kids": true,
  "is_good_with_pets": true,
  "status": "available",
  "intake_date": "2025-01-10"
}

Response (201):
{
  "success": true,
  "data": { ...animal object... },
  "message": "Animal profile created successfully"
}
```

### Filter Parameters
| Parameter | Type | Options |
|---|---|---|
| `species` | string | dog, cat, bird, rabbit, other |
| `status` | string | intake, medical_evaluation, treatment, available, adoption_pending, adopted, fostered |
| `gender` | string | male, female, unknown |
| `breed` | string | Partial match |
| `age_min` | integer | Minimum age in years |
| `age_max` | integer | Maximum age in years |
| `is_vaccinated` | boolean | |
| `is_spayed_neutered` | boolean | |
| `is_good_with_kids` | boolean | |
| `is_good_with_pets` | boolean | |
| `search` | string | Searches name, breed, description |
| `ordering` | string | name, created_at, -created_at |

---

## 3. Reports (`/api/v1/reports/`)

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/reports/` | Yes | Admin, Staff, Volunteer | List reports |
| POST | `/reports/` | No | — | Create report (anonymous allowed) |
| GET | `/reports/{id}/` | Yes | Admin, Staff, Volunteer, Owner | Get report detail |
| PATCH | `/reports/{id}/` | Yes | Admin, Staff, Volunteer | Update report |
| POST | `/reports/{id}/assign/` | Yes | Admin, Staff | Assign volunteer |
| POST | `/reports/{id}/update-status/` | Yes | Admin, Staff, Volunteer | Change status |
| GET | `/reports/track/{tracking_id}/` | No | — | Public report tracking |
| GET | `/reports/{id}/images/` | Yes | Admin, Staff, Volunteer | List report images |
| POST | `/reports/{id}/images/` | No | — | Upload report images |

### Create Report
```
POST /api/v1/reports/

Request (multipart/form-data):
{
  "animal_type": "dog",
  "description": "Injured stray dog near SM North EDSA parking lot, limping on front left leg",
  "urgency": "high",
  "latitude": 14.6576,
  "longitude": 121.0355,
  "address": "SM North EDSA, Quezon City",
  "reporter_name": "Maria Santos",      // optional
  "reporter_phone": "+639171234567",     // optional
  "reporter_email": "maria@email.com",   // optional
  "images": [File, File]                 // optional, up to 5
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "tracking_id": "RPT-A3F2-X7B1",
    "status": "submitted",
    "animal_type": "dog",
    "urgency": "high",
    "created_at": "2025-01-15T08:00:00Z"
  },
  "message": "Report submitted successfully. Your tracking ID is RPT-A3F2-X7B1"
}
```

### Assign Volunteer
```
POST /api/v1/reports/{id}/assign/

Request:
{
  "volunteer_id": "uuid"
}

Response (200):
{
  "success": true,
  "data": { ...updated report... },
  "message": "Volunteer assigned successfully"
}
```

### Update Status
```
POST /api/v1/reports/{id}/update-status/

Request:
{
  "status": "dispatched",
  "notes": "Volunteer en route to location"
}

Response (200):
{
  "success": true,
  "data": { ...updated report... },
  "message": "Status updated to dispatched"
}
```

### Public Tracking
```
GET /api/v1/reports/track/RPT-A3F2-X7B1/

Response (200):
{
  "success": true,
  "data": {
    "tracking_id": "RPT-A3F2-X7B1",
    "status": "dispatched",
    "urgency": "high",
    "animal_type": "dog",
    "created_at": "2025-01-15T08:00:00Z",
    "updated_at": "2025-01-15T09:30:00Z"
  }
}
```

---

## 4. Adoptions (`/api/v1/adoptions/`)

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/adoptions/` | Yes | Admin, Staff (all); Adopter (own) | List applications |
| POST | `/adoptions/` | Yes | Adopter | Submit application |
| GET | `/adoptions/{id}/` | Yes | Admin, Staff, Owner | Get application detail |
| POST | `/adoptions/{id}/review/` | Yes | Admin, Staff | Update application status |
| POST | `/adoptions/{id}/withdraw/` | Yes | Owner | Withdraw application |

### Submit Application
```
POST /api/v1/adoptions/

Request:
{
  "animal_id": "uuid",
  "housing_type": "house",
  "owns_or_rents": "owns",
  "landlord_permission": null,
  "has_yard": true,
  "other_pets": "One cat, 3 years old, indoor",
  "children_info": "Two children, ages 8 and 12",
  "pet_experience": "Had dogs growing up, current cat owner for 3 years",
  "work_schedule": "Work from home, available most of the day",
  "vet_reference": "Dr. Santos, Happy Paws Vet Clinic, +639171234567",
  "personal_references": "Jane Doe (+639181234567), John Smith (+639191234567)",
  "reason_to_adopt": "Our family has been looking for a dog companion...",
  "agrees_to_home_visit": true
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "animal": { "id": "uuid", "name": "Bantay" },
    "status": "submitted",
    "created_at": "2025-01-15T08:00:00Z"
  },
  "message": "Application submitted successfully"
}
```

### Review Application
```
POST /api/v1/adoptions/{id}/review/

Request:
{
  "status": "approved",                    // under_review | interview_scheduled | approved | rejected
  "staff_notes": "Good candidate",         // internal
  "interview_date": "2025-01-20T14:00:00Z", // if scheduling interview
  "rejection_reason": null,                 // internal, if rejecting
  "rejection_message": null                 // sent to adopter, if rejecting
}

Response (200):
{
  "success": true,
  "data": { ...updated application... },
  "message": "Application approved"
}
```

---

## 5. Donations (`/api/v1/donations/`)

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/donations/` | Yes | Admin (all); Donor (own) | List donations |
| POST | `/donations/` | No | — | Create donation |
| GET | `/donations/{id}/` | Yes | Admin, Owner | Get donation detail |
| GET | `/donations/summary/` | Yes | Admin | Donation statistics |
| POST | `/donations/{id}/cancel-recurring/` | Yes | Owner | Cancel recurring donation |

### Create Donation
```
POST /api/v1/donations/

Request:
{
  "amount": 500.00,
  "donation_type": "one_time",         // one_time | monthly | sponsorship
  "animal_id": null,                   // required for sponsorship
  "is_anonymous": false,
  "donor_name": "Juan Dela Cruz",      // for anonymous donations
  "donor_email": "juan@email.com",     // for anonymous donations
  "message": "For the care of rescued animals"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": "500.00",
    "donation_type": "one_time",
    "payment_status": "completed",
    "created_at": "2025-01-15T08:00:00Z"
  },
  "message": "Thank you for your donation!"
}
```

### Donation Summary
```
GET /api/v1/donations/summary/

Response (200):
{
  "success": true,
  "data": {
    "total_raised": "1250000.00",
    "total_donors": 342,
    "this_month": "85000.00",
    "by_type": {
      "one_time": "750000.00",
      "monthly": "350000.00",
      "sponsorship": "150000.00"
    },
    "recent_donations": [...]
  }
}
```

---

## 6. Notifications (`/api/v1/notifications/`)

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/notifications/` | Yes | Any | List user's notifications |
| GET | `/notifications/unread-count/` | Yes | Any | Get unread count |
| POST | `/notifications/{id}/read/` | Yes | Owner | Mark as read |
| POST | `/notifications/mark-all-read/` | Yes | Any | Mark all as read |

### List Notifications
```
GET /api/v1/notifications/?is_read=false&page=1

Response (200):
{
  "success": true,
  "data": {
    "count": 25,
    "next": "/api/v1/notifications/?page=2",
    "previous": null,
    "results": [
      {
        "id": "uuid",
        "notification_type": "adoption_approved",
        "title": "Application Approved!",
        "message": "Your adoption application for Bantay has been approved.",
        "data": {
          "animal_id": "uuid",
          "application_id": "uuid",
          "link": "/dashboard/adoptions/uuid"
        },
        "is_read": false,
        "created_at": "2025-01-15T08:00:00Z"
      }
    ]
  }
}
```

### Unread Count
```
GET /api/v1/notifications/unread-count/

Response (200):
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

## 7. Content (`/api/v1/content/`)

### Success Stories

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/content/stories/` | No | — | List published stories |
| POST | `/content/stories/` | Yes | Admin, Staff | Create story |
| GET | `/content/stories/{slug}/` | No | — | Get story detail |
| PATCH | `/content/stories/{slug}/` | Yes | Admin, Staff | Update story |
| DELETE | `/content/stories/{slug}/` | Yes | Admin | Delete story |

### Events

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/content/events/` | No | — | List published events |
| POST | `/content/events/` | Yes | Admin, Staff | Create event |
| GET | `/content/events/{slug}/` | No | — | Get event detail |
| PATCH | `/content/events/{slug}/` | Yes | Admin, Staff | Update event |
| DELETE | `/content/events/{slug}/` | Yes | Admin | Delete event |

### List Stories
```
GET /api/v1/content/stories/?is_featured=true

Response (200):
{
  "success": true,
  "data": {
    "count": 12,
    "results": [
      {
        "id": "uuid",
        "title": "Bantay Finds His Forever Home",
        "slug": "bantay-finds-his-forever-home",
        "excerpt": "After 6 months in the shelter...",
        "featured_image": "/media/stories/uuid/hero.jpg",
        "animal": { "id": "uuid", "name": "Bantay" },
        "author": { "id": "uuid", "first_name": "Admin" },
        "is_featured": true,
        "published_at": "2025-01-15T08:00:00Z"
      }
    ]
  }
}
```

---

## 8. Dashboard (`/api/v1/dashboard/`)

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/dashboard/stats/` | Yes | Admin, Staff | System-wide statistics |
| GET | `/dashboard/activity/` | Yes | Admin, Staff | Recent activity feed |

### Dashboard Stats
```
GET /api/v1/dashboard/stats/

Response (200):
{
  "success": true,
  "data": {
    "animals": {
      "total": 523,
      "available": 145,
      "adopted": 312,
      "in_treatment": 66
    },
    "reports": {
      "total": 1250,
      "pending": 23,
      "in_progress": 15,
      "this_month": 45
    },
    "adoptions": {
      "total_applications": 890,
      "pending_review": 12,
      "approved_this_month": 28
    },
    "donations": {
      "total_raised": "1250000.00",
      "this_month": "85000.00",
      "donor_count": 342
    },
    "users": {
      "total": 2500,
      "new_this_month": 120
    }
  }
}
```

---

## 9. Admin User Management (`/api/v1/auth/users/`)

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/auth/users/` | Yes | Admin | List all users |
| GET | `/auth/users/{id}/` | Yes | Admin | Get user detail |
| PATCH | `/auth/users/{id}/` | Yes | Admin | Update user (role, active) |

---

## API Schema & Documentation

| Endpoint | Description |
|---|---|
| GET `/api/schema/` | OpenAPI 3.0 schema (JSON) |
| GET `/api/docs/` | Swagger UI |

---

## Rate Limiting

| Endpoint Pattern | Rate |
|---|---|
| `POST /auth/login/` | 5/min per IP |
| `POST /auth/register/` | 3/min per IP |
| `POST /auth/token/refresh/` | 10/min per IP |
| `POST /reports/` | 10/min per IP |
| All authenticated endpoints | 100/min per user |
| All public read endpoints | 200/min per IP |

---

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": {
    "email": ["Enter a valid email address."],
    "password": ["This field is required."]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "data": null,
  "message": "Authentication credentials were not provided.",
  "errors": null
}
```

### 403 Forbidden
```json
{
  "success": false,
  "data": null,
  "message": "You do not have permission to perform this action.",
  "errors": null
}
```

### 404 Not Found
```json
{
  "success": false,
  "data": null,
  "message": "Not found.",
  "errors": null
}
```
