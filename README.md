# SafeRoute Tamil Nadu

SafeRoute Tamil Nadu is a community-powered road hazard reporting and route-awareness platform localized for all 38 districts of Tamil Nadu. The interface includes Tamil and English labels, district-aware reporting, and a statewide map view.

## Technology

- React + Vite + JavaScript
- Java 21 + Spring Boot 3
- **Supabase PostgreSQL** database (via Spring Data JPA)
- OpenStreetMap tiles through Leaflet
- JWT authentication
- Haversine-based nearby-hazard search

## MVP features

- Register and log in
- Create road hazard reports with coordinates
- Browse and filter reports
- Find nearby reports using latitude/longitude distance calculations
- View reports on an interactive Tamil Nadu map with district selection and district-level zoom
- Select one of Tamil Nadu’s 38 districts while submitting a report
- Tamil Nadu-focused hazard categories
- Basic admin moderation endpoints
- Responsive dashboard UI

## Repository layout

```text
SafeRoute/
├── backend/                 Spring Boot REST API
│   └── database/
│       └── supabase-schema.sql
├── frontend/                React + JavaScript web app
├── README.md
└── RUNNING_GUIDE.md
```

## Quick start

1. Install Java 21+, Maven 3.9+, and Node.js 20+.
2. Create a Supabase project and run `backend/database/supabase-schema.sql` in the Supabase SQL Editor.
3. Configure `backend/.env` using `backend/.env.example`.
4. Run backend: `cd backend && mvn spring-boot:run`.
5. Run frontend in another terminal: `cd frontend && npm install && npm run dev`.
6. Open http://localhost:5173.

See [RUNNING_GUIDE.md](RUNNING_GUIDE.md) for the full Supabase setup.

## Default development configuration

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173`
- API prefix: `/api/v1`
- Database: Supabase PostgreSQL

No default admin account is created. Register a user, then promote that user to `ADMIN` using the SQL Editor as described in the running guide.

## Important scope and security notes

This is a working MVP foundation, not a certified navigation or emergency-response system. Community-submitted reports are not a guarantee that a route is safe.

- Keep the Supabase database password on the backend only. Never use it in a `VITE_*` variable.
- Set a long random `JWT_SECRET` (at least 32 bytes).
- Use the Supabase session pooler connection string with SSL for typical hosted deployments.
- Configure exact CORS origins and HTTPS.
- The Spring Boot API connects directly to PostgreSQL; Supabase Auth and the Supabase Data API are not used by this JWT-based MVP.
- Existing MongoDB records are not automatically copied. Export/import existing users and reports before switching production traffic.
- Add email verification, password reset, rate limiting, audit logging, backups, and abuse reporting before public launch.
