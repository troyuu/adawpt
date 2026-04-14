# Adawpt — Requirements Specification

## Overview

Adawpt is a full-stack Stray Animal Rescue & Adoption System designed for Philippine LGUs and NGOs. It enables citizens to report stray/abused animals, volunteers to coordinate rescues, shelters to manage animal care, and adopters to find companions.

---

## Module 1: Authentication & User Management

### User Roles
| Role | Description |
|---|---|
| `admin` | Full system access, user management, analytics |
| `shelter_staff` | Manage animals, process adoptions, update medical records |
| `volunteer` | Respond to rescue reports, coordinate field operations |
| `adopter` | Browse animals, submit adoption applications, track status |
| `reporter` | Submit stray/abuse reports (can be anonymous) |

### Features
- **Registration:** Email-based signup with role selection (adopter/volunteer/reporter)
- **Login:** Email + password, returns JWT access + refresh tokens
- **JWT Auth:** 15-min access token, 7-day refresh token, auto-refresh, token blacklisting on logout
- **Profile Management:** View/edit profile (name, phone, address, avatar)
- **Admin User Management:** List/search users, change roles, deactivate accounts
- **Password Reset:** Email-based forgot/reset password flow

### Business Rules
- Admin and shelter_staff roles assigned manually by admin only
- Email must be verified before full account access
- Deactivated users cannot log in but data is preserved
- All auth actions logged in audit trail

---

## Module 2: Animal Reporting

### Features
- **Submit Report:** Location (map pin or address), description, urgency level, photos (up to 5), animal type/condition
- **Anonymous Reporting:** No account required to submit a report; optional contact info
- **Report Tracking:** Unique tracking ID returned on submission for status checks
- **Status Workflow:** `submitted` → `acknowledged` → `dispatched` → `rescued` → `sheltered` → `closed`
- **Volunteer Assignment:** Admin/staff assign volunteer(s) to reports
- **Report Dashboard:** Filter by status, urgency, location, date range

### Urgency Levels
| Level | Description | SLA |
|---|---|---|
| `critical` | Immediate danger to animal life | 2 hours |
| `high` | Injured or in distress | 12 hours |
| `medium` | Stray needing rescue | 48 hours |
| `low` | General sighting/concern | 1 week |

### Business Rules
- Reports with `critical` urgency trigger immediate admin notification
- Volunteers only see reports assigned to them or unassigned in their area
- Photos auto-resized and compressed on upload (max 2MB each)
- Location stored as latitude/longitude + human-readable address
- Reports can be updated by reporter (if logged in) or assigned volunteer/staff

---

## Module 3: Rescue Operations

### Features
- **Rescue Coordination:** Volunteer accepts/declines assignment, updates field status
- **Field Updates:** Volunteer posts real-time text updates and photos during rescue
- **Rescue Completion:** Mark rescue complete, transition report to `rescued`
- **Handoff to Shelter:** Record which shelter receives the animal, create animal profile

### Business Rules
- Volunteer must update status within 1 hour of dispatch or auto-escalate
- Rescue completion requires at least one photo
- Animal profile auto-created when report status changes to `sheltered`

---

## Module 4: Animal Profiles & Shelter Management

### Features
- **Animal Profile:** Species, breed, name, age (estimated), gender, weight, color/markings, description, temperament, special needs
- **Photo Gallery:** Multiple images per animal, primary photo designation
- **Medical Records:** Vaccinations, treatments, spay/neuter status, health conditions, vet notes with dates
- **Status Tracking:** `intake` → `medical_evaluation` → `treatment` → `available` → `adoption_pending` → `adopted` / `fostered` / `transferred` / `deceased`
- **Foster Records:** Track animals in foster care with foster family info, start/end dates
- **Search & Filter:** Species, breed, age range, gender, size, status, good with kids/pets

### Business Rules
- Only shelter_staff and admin can create/edit animal profiles
- Medical records are append-only (no deletion, only corrections via new entry)
- Animals marked as `adopted` cannot be re-listed without admin override
- Primary photo displayed in search results and cards

---

## Module 5: Adoption Process

### Features
- **Browse Animals:** Public listing of `available` animals with filters
- **Adoption Application:** Multi-step form capturing living situation, pet experience, references, care commitment
- **Application Review:** Staff reviews application, schedules interview, approves/rejects
- **Status Tracking:** `submitted` → `under_review` → `interview_scheduled` → `approved` / `rejected`
- **Adoption Completion:** On approval, animal status → `adopted`, adopter linked to animal
- **Application Withdrawal:** Adopter can withdraw application before approval

### Application Form Fields
- Housing type (house/apartment/condo)
- Own or rent (if rent, landlord permission)
- Yard/outdoor space availability
- Other pets in household
- Children in household (ages)
- Previous pet ownership experience
- Work schedule / time available for pet
- Veterinarian reference
- Personal references (2)
- Why they want to adopt this animal
- Agreement to home visit

### Business Rules
- One active application per animal per adopter
- Adopter can have multiple applications for different animals
- Rejection includes reason (private to staff) and message to adopter
- Approved applications auto-reject other pending applications for same animal
- 72-hour window to complete adoption after approval, then auto-expire

---

## Module 6: Donations

### Features
- **One-time Donation:** Custom or preset amounts ($10, $25, $50, $100)
- **Monthly Recurring:** Subscribe to monthly donations
- **Animal Sponsorship:** Sponsor a specific animal's care
- **Donation History:** View past donations and receipts
- **Donor Recognition:** Public donor wall (opt-in)
- **Analytics:** Total raised, monthly trends, top donors, by-type breakdown

### Business Rules
- Payment processing via placeholder (no real payment gateway in v1)
- Donation amounts in Philippine Peso (₱)
- Minimum donation: ₱50
- Recurring donations can be paused/cancelled
- Tax receipt generation (placeholder PDF)
- Anonymous donations supported

---

## Module 7: Dashboard & Analytics

### Admin Dashboard
- Total animals in system (by status breakdown)
- Pending reports count and urgency distribution
- Active adoption applications
- Monthly donation totals and trends
- Recent activity feed (last 50 actions)
- User registration trends
- Rescue response time averages

### Shelter Staff Dashboard
- Animals under their care
- Pending adoption applications to review
- Medical records due for update
- Incoming rescue handoffs

### Volunteer Dashboard
- Assigned rescue missions
- Mission history and stats
- Available (unassigned) reports nearby

### Adopter Dashboard
- My applications and their statuses
- My adopted animals
- Favorited animals
- Recommended animals

### Business Rules
- Dashboard data refreshes every 30 seconds via polling (WebSocket for notifications)
- Analytics charts use 30-day rolling window by default
- Export to CSV for admin reports

---

## Module 8: Notifications

### Notification Types
| Event | Recipients | Channel |
|---|---|---|
| New report submitted | Admins | In-app, real-time |
| Report assigned | Volunteer | In-app, real-time |
| Report status changed | Reporter (if logged in) | In-app |
| New adoption application | Staff | In-app, real-time |
| Application status changed | Adopter | In-app, real-time |
| Adoption approved | Adopter + Staff | In-app, real-time |
| New donation received | Admin | In-app |
| Welcome | New user | In-app |

### Features
- **In-app Notifications:** Bell icon with unread count badge
- **Real-time Delivery:** Via Socket.IO WebSocket connection
- **Notification Center:** Full list with mark read/unread, mark all read
- **Notification Preferences:** Toggle notification types on/off (future)

### Business Rules
- Notifications persisted to database for offline users
- Real-time delivery via Redis pub/sub → Socket.IO
- Unread count cached in Redis for performance
- Notifications auto-expire after 90 days

---

## Module 9: Content & Community

### Success Stories
- Title, body (rich text), photos, featured animal link
- Published/draft status
- Public listing and detail pages
- Admin/staff create and manage

### Events
- Title, description, date/time, location, type (adoption drive, fundraiser, volunteer day)
- Published/draft status
- Public listing and detail pages
- RSVP tracking (future enhancement)

### Business Rules
- Only admin and shelter_staff can create content
- Published stories appear on public landing page
- Featured stories highlighted in hero section

---

## Module 10: Settings & Administration

### System Settings (Admin Only)
- Organization name and branding
- Default notification preferences
- Adoption application form toggles
- Donation preset amounts
- Report urgency SLA times

### User Settings
- Profile information
- Password change
- Notification preferences
- Account deactivation request

### Audit Log
- All create/update/delete actions logged
- User, action, model, object ID, timestamp, IP address
- Admin-only access to audit log viewer
- 1-year retention

---

## Non-Functional Requirements

### Performance
- API response time < 200ms (p95) for simple queries
- Page load time < 3 seconds on 4G connection
- Image upload processing < 5 seconds
- Support 1000 concurrent users

### Security
- JWT with short-lived access tokens (15 min)
- Refresh token rotation with blacklisting
- CORS restricted to frontend origin
- Input validation on all endpoints (serializer-level)
- File upload type/size validation
- SQL injection protection (Django ORM)
- XSS protection (React auto-escaping + DRF)
- CSRF protection on cookie-based sessions
- Rate limiting on auth endpoints

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigable
- Screen reader friendly (ARIA labels)
- Color contrast ratio ≥ 4.5:1
- Focus indicators on all interactive elements

### Internationalization
- English as primary language
- Filipino/Tagalog as secondary (future)
- Philippine Peso (₱) as currency
- Philippine date format (Month DD, YYYY)
- Philippine phone format (+63)

### Browser Support
- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+
- Mobile Chrome & Safari (iOS 17+, Android 14+)
