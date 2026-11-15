# SafeRoute – Supabase Running Guide

This guide configures SafeRoute to use Supabase PostgreSQL instead of MongoDB Atlas. The React frontend still talks to the Spring Boot API; database credentials remain server-side.

## 1. Prerequisites

| Tool | Recommended version |
|---|---|
| Java JDK | 21 |
| Maven | 3.9+ |
| Node.js | 20 LTS or newer |
| Git | Latest |
| Supabase | A project with PostgreSQL |

## 2. Create your Supabase database

1. Open [Supabase](https://supabase.com/) and create a new project.
2. Choose a strong database password and save it securely.
3. Wait until the project finishes provisioning.
4. Open **SQL Editor -> New query**.
5. Open `backend/database/supabase-schema.sql` from this repository, copy its full contents, paste it into the SQL Editor, and click **Run**.
6. Open **Project Settings -> Database -> Connect**.
7. Choose **Session pooler** and copy the connection details. The session pooler is suitable for a long-running Spring Boot server. Use the host, port, database, username and password supplied by Supabase.

Do not use the Supabase `anon` key or `service_role` key as a JDBC password. This application connects to PostgreSQL directly from the backend.

## 3. Configure the backend

From PowerShell:

```powershell
cd SafeRoute\backend
Copy-Item .env.example .env
```

Edit `backend/.env` with your actual Supabase session-pooler values. Example format (replace every placeholder with the values from your Supabase dashboard):

```env
SUPABASE_JDBC_URL=jdbc:postgresql://YOUR_POOLER_HOST:5432/postgres?sslmode=require
SUPABASE_DB_USER=postgres.YOUR_PROJECT_REF
SUPABASE_DB_PASSWORD=YOUR_DATABASE_PASSWORD
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-bytes
CORS_ORIGINS=http://localhost:5173
SERVER_PORT=8080
```

The exact pooler host and username are project-specific. Keep `sslmode=require`. The sample `.env` file is not automatically loaded by Spring Boot; set these variables in your shell, IDE run configuration, or deployment provider.

### Windows PowerShell example

```powershell
$env:SUPABASE_JDBC_URL="jdbc:postgresql://YOUR_POOLER_HOST:5432/postgres?sslmode=require"
$env:SUPABASE_DB_USER="postgres.YOUR_PROJECT_REF"
$env:SUPABASE_DB_PASSWORD="YOUR_DATABASE_PASSWORD"
$env:JWT_SECRET="replace-this-with-a-long-random-secret-at-least-32-bytes"
$env:CORS_ORIGINS="http://localhost:5173"
mvn spring-boot:run
```

The backend starts at `http://localhost:8080`. Check `http://localhost:8080/actuator/health`.

## 4. Run the frontend

Open a second PowerShell terminal:

```powershell
cd SafeRoute\frontend
npm install
Copy-Item .env.example .env
npm run dev
```

The default frontend API URL is:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Open http://localhost:5173.

## 5. First-time use

1. Register a user from the website.
2. Log in.
3. Create a road hazard report with title, description, category, severity and coordinates.
4. Browse reports and use nearby search.
5. Open the Tamil Nadu map to view reports.

For a Chennai test location, use latitude `13.0827` and longitude `80.2707`.

## 6. Promote an admin account

Register a normal account first. In Supabase **SQL Editor**, run this query with the email used during registration:

```sql
update public.users
set role = 'ADMIN'
where email = lower('your-email@example.com');
```

Log out and log in again so the new role is included in the JWT. Never let public users change their own role.

## 7. API examples

The API routes remain unchanged after the database migration.

### Register

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@example.com","password":"ChangeMe123!"}'
```

### Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"ChangeMe123!"}'
```

### List reports

```bash
curl "http://localhost:8080/api/v1/reports?page=0&size=20"
```

### Nearby reports

```bash
curl "http://localhost:8080/api/v1/reports/nearby?latitude=13.0827&longitude=80.2707&radiusMeters=5000"
```

## 8. Build for production

Backend:

```powershell
cd backend
mvn clean package
```

Frontend:

```powershell
cd frontend
npm install
npm run build
```

The frontend production output is `frontend/dist`.

## 9. Deploy

### Backend

Deploy the Spring Boot `backend` directory to a Java-compatible host such as Render, Railway or Fly.io. Configure these environment variables in the provider dashboard:

- `SUPABASE_JDBC_URL`
- `SUPABASE_DB_USER`
- `SUPABASE_DB_PASSWORD`
- `JWT_SECRET`
- `CORS_ORIGINS` (the exact Vercel frontend URL)
- `SERVER_PORT` (if required by the provider)

Use the Supabase session pooler values and SSL. Never commit secrets or put the database password in frontend variables.

### Frontend on Vercel

- Import the GitHub repository.
- Set Root Directory to `frontend`.
- Build command: `npm run build`.
- Output directory: `dist`.
- Set `VITE_API_BASE_URL` to your deployed Spring Boot API URL ending in `/api/v1`.

## 10. Existing MongoDB data

Changing the application code does not migrate existing MongoDB documents. If your old MongoDB database contains users or reports that must be retained, export them and import them into the matching PostgreSQL tables before switching the live backend. Map MongoDB report `location.coordinates[0]` to `longitude` and `location.coordinates[1]` to `latitude`. Preserve user UUIDs only if they are valid UUID strings; otherwise generate UUIDs and update report `reported_by` references accordingly.

## 11. Troubleshooting

**Connection refused / timeout**
- Verify the pooler host, port, database and username copied from Supabase.
- Confirm the database password is correct.
- Use the session pooler and `sslmode=require`.

**Authentication failed**
- Supabase pooler usernames commonly include the project reference, for example `postgres.YOUR_PROJECT_REF`. Use the exact dashboard value.

**CORS error**
- Set `CORS_ORIGINS` to the exact deployed frontend origin and restart the backend.

**Frontend network error**
- Confirm the backend is running and `VITE_API_BASE_URL` points to it.

**Admin page is forbidden**
- Promote the account in SQL Editor, then log out and log back in.

## 12. Security and production checklist

- [ ] Rotate development secrets and use a strong JWT secret.
- [ ] Keep Supabase database credentials on the backend only.
- [ ] Use HTTPS and exact CORS origins.
- [ ] Configure database backups and monitoring.
- [ ] Add rate limiting, email verification and password recovery.
- [ ] Add audit logging and abuse prevention.
- [ ] Publish privacy information and explain that reports are community supplied.
