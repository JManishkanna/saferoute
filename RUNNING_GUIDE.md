# SafeRoute – Running Guide

This guide explains how to run the project locally and prepare it for deployment.

## 1. Prerequisites

Install the following:

| Tool | Recommended version |
|---|---|
| Java JDK | 21 |
| Maven | 3.9+ |
| Node.js | 20 LTS or newer |
| npm | Included with Node |
| MongoDB | 7+ or MongoDB Atlas |
| Git | Latest |

Check installations:

```bash
java -version
mvn -version
node -v
npm -v
```

## 2. Database setup

### Option A: Local MongoDB

Install and start MongoDB Community Server. The default connection string used by the backend is:

```text
mongodb://localhost:27017/saferoute
```

### Option B: MongoDB Atlas

1. Create a MongoDB Atlas project and cluster.
2. Create a database user with a strong password.
3. Configure Network Access. For development, allow your current IP address.
4. Copy the connection string.
5. Replace the username, password, and database name as appropriate.

Example:

```text
mongodb+srv://USERNAME:PASSWORD@cluster.example.mongodb.net/saferoute?retryWrites=true&w=majority
```

Do not commit real database credentials to GitHub.

## 3. Configure the backend

Open a terminal:

```bash
cd SafeRoute/backend
```

Copy the example environment file:

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux**
```bash
cp .env.example .env
```

Set these environment variables in your terminal or IDE run configuration:

| Variable | Example |
|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/saferoute` |
| `JWT_SECRET` | Long random secret, 32+ bytes |
| `CORS_ORIGINS` | `http://localhost:5173` |
| `SERVER_PORT` | `8080` |

The `.env` file is a reference file; Spring Boot does not automatically load it. Either export the variables in your shell or configure them in your IDE. For quick local testing, the defaults in `application.yml` work with local MongoDB, but replace the JWT secret before use.

### Windows PowerShell example

```powershell
$env:MONGODB_URI="mongodb://localhost:27017/saferoute"
$env:JWT_SECRET="replace-this-with-a-long-random-secret-at-least-32-bytes"
$env:CORS_ORIGINS="http://localhost:5173"
mvn spring-boot:run
```

### macOS / Linux example

```bash
export MONGODB_URI="mongodb://localhost:27017/saferoute"
export JWT_SECRET="replace-this-with-a-long-random-secret-at-least-32-bytes"
export CORS_ORIGINS="http://localhost:5173"
mvn spring-boot:run
```

The backend starts at:

```text
http://localhost:8080
```

Health check:

```text
http://localhost:8080/actuator/health
```

## 4. Configure and run the frontend

Open a second terminal:

```bash
cd SafeRoute/frontend
npm install
```

Create the local environment file:

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux**
```bash
cp .env.example .env
```

The default value is:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Start Vite:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## 5. First-time use

1. Open the website.
2. Select **Create account** and register.
3. Log in.
4. Use **Report hazard** to create a report.
5. Add a title, description, hazard type, severity, and latitude/longitude.
6. Open the map to see reports.
7. Use the nearby reports feature by entering a latitude and longitude.

For a quick Chennai test location, you can use:
- Latitude: `13.0827`
- Longitude: `80.2707`

Use real observations only. Do not create misleading public hazard reports.

## 6. Admin access for local development

The project does not ship with a default admin user.

For local development only, register a normal account, then update its role in MongoDB:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "ADMIN" } }
)
```

Log out and log in again so the new role is included in the newly issued JWT.

Never expose direct database access or allow public users to change their own role. In a production system, role changes must be performed through a protected, audited administrative process.

## 7. API examples

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

The response contains a JWT token. Use it as a Bearer token for protected requests.

### Create report

```bash
curl -X POST http://localhost:8080/api/v1/reports \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Pothole near junction",
    "description":"Large pothole reported by a commuter",
    "category":"POTHOLE",
    "severity":"HIGH",
    "latitude":13.0827,
    "longitude":80.2707
  }'
```

### List reports

```bash
curl "http://localhost:8080/api/v1/reports?page=0&size=20"
```

### Nearby reports

```bash
curl "http://localhost:8080/api/v1/reports/nearby?latitude=13.0827&longitude=80.2707&radiusMeters=5000"
```

### Admin: verify report

```bash
curl -X PATCH http://localhost:8080/api/v1/admin/reports/REPORT_ID/verify \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## 8. Build for production

### Backend

```bash
cd backend
mvn clean package
java -jar target/saferoute-backend-1.0.0.jar
```

### Frontend

Set the production API URL in Vercel environment variables:

```env
VITE_API_BASE_URL=https://YOUR_BACKEND_HOST/api/v1
```

Then:

```bash
cd frontend
npm ci
npm run build
```

The production build is generated in `frontend/dist`.

## 9. Deployment outline

### MongoDB Atlas
- Create a production database user.
- Restrict network access to the backend provider where possible.
- Enable backups.
- Never expose the connection string to the browser.

### Spring Boot backend
- Deploy `backend` to Render, Railway, Fly.io, or another Java-compatible host.
- Configure `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGINS`, and `SERVER_PORT`.
- Set CORS to the exact production frontend origin.
- Use HTTPS and a persistent production database.

### React frontend
- Import the repository into Vercel.
- Set the root directory to `frontend`.
- Build command: `npm run build`.
- Output directory: `dist`.
- Set `VITE_API_BASE_URL` to the deployed backend API URL.

## 10. Troubleshooting

### Backend cannot connect to MongoDB
- Confirm MongoDB is running.
- Check the connection string and database credentials.
- For Atlas, check Network Access and database-user permissions.
- URL-encode special characters in the password.

### CORS error
- Set `CORS_ORIGINS` to the exact frontend origin.
- Restart the backend after changing environment variables.
- Do not use wildcard CORS with credentialed requests.

### Frontend says network error
- Confirm the backend is running on port 8080.
- Check `VITE_API_BASE_URL`.
- Restart Vite after changing `.env`.

### Map tiles do not load
- Check internet access.
- Check browser console for tile-provider errors.
- Follow the tile provider's usage policy. For a production service with significant traffic, use a suitable hosted tile provider or operate your own infrastructure.

### JWT invalid or expired
- Log in again to receive a new token.
- Ensure frontend and backend use the same API host.
- Replace the development JWT secret with a stable secret.

## 11. Current MVP limitations

This starter currently includes account registration/login, report creation/listing, geospatial nearby search, map display, and basic admin verification. It does not yet implement a full production route planner, image upload pipeline, AI classification, push notifications, report comments/voting, or password reset. Add and test these capabilities before advertising them to real users.

## 12. Before public launch

- [ ] Replace development secrets.
- [ ] Configure HTTPS and exact CORS origins.
- [ ] Add rate limiting and abuse prevention.
- [ ] Add email verification and password recovery.
- [ ] Add secure refresh-token rotation and revocation.
- [ ] Add image storage with file validation and metadata stripping.
- [ ] Add automated tests and CI.
- [ ] Add monitoring, backups, and incident response.
- [ ] Publish privacy policy and terms.
- [ ] Clearly label community-reported information and its age.
- [ ] Validate route-risk calculations with real-world data before public use.


## Tamil Nadu configuration notes

- The frontend includes the 38 Tamil Nadu district names in the district selector.
- The statewide map opens at a Tamil Nadu overview; selecting a district zooms to its approximate map centre.
- New reports include the selected district and `Tamil Nadu` in the existing `address` field, so no MongoDB migration is needed.
- Hazard categories are stored as strings by the current backend. Existing reports using older category names remain readable.
- District coordinates are approximate map-centre presets, not official administrative boundary data. Users should use the browser location button or correct coordinates for precise reports.
- This is a community information tool, not an official government reporting channel. Verify hazards and contact the appropriate local authority for urgent issues.


## Animation and interaction updates

The frontend now includes scroll-triggered reveal transitions, staggered report rows, a gently animated hero/orbit illustration, interactive hover lift and glow effects for cards, animated navigation underlines, button sheen feedback, form focus transitions, and page-entry motion. These effects are written in CSS and the browser Intersection Observer API, so no animation package or additional dependency is required. The interface also respects the operating system **Reduce motion** accessibility preference.
