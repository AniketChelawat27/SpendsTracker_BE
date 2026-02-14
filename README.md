# Spend Tracker API (Backend)

Node.js + Express + **MongoDB** backend for the Spend Tracker app. Verifies **Firebase Auth** and stores data per user.

## Stack

- **Node.js**, **Express**
- **MongoDB** (Mongoose)
- **Firebase Admin SDK** (verify ID tokens from frontend)
- **CORS** enabled for frontend origin

## Project structure

```
src/
  index.js          # Entry: Firebase init, DB connect, mount routes
  config/
    db.js           # Mongoose connection
  middleware/
    auth.js         # Firebase ID token verification → req.uid
  models/           # Mongoose schemas (Salary, Expense, Investment, Activity, Member, Funds)
  routes/           # data, salary, expenses, investments, activities, members, funds
  utils/
    toJSON.js       # _id → id for API responses
```

## Setup

### 1. MongoDB

- Install MongoDB and **MongoDB Compass** (or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)).
- See **[MONGODB_COMPASS.md](./MONGODB_COMPASS.md)** for creating the database `spend-tracker` and connection string.

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env`:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `3001`) |
| `MONGODB_URI` | MongoDB connection string (e.g. `mongodb://localhost:27017/spend-tracker`) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Firebase service account JSON (e.g. `./serviceAccountKey.json`) |
| or `FIREBASE_SERVICE_ACCOUNT` | Minified JSON string of the same file (for production) |

Firebase service account: Firebase Console → Project settings → Service accounts → Generate new private key. Save as `serviceAccountKey.json` in the project root (and add to `.gitignore`).

### 3. Install and run

```bash
npm install
npm start
```

Dev with auto-reload:

```bash
npm run dev
```

API base URL: **http://localhost:3001**. All data routes are under **/api**.

---

## API (all require `Authorization: Bearer <firebase-id-token>`)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | No auth. Health check. |
| GET | /api/data/:year/:month | Month data (salaries, expenses, investments, activities) |
| GET | /api/data/year/:year | Full year data |
| GET/POST | /api/members | List / add household member |
| DELETE | /api/members/:id | Remove member |
| GET/PUT | /api/funds | Get / update emergency & vacation funds |
| POST | /api/salary | Add salary entry |
| PUT/DELETE | /api/salary/:id | Update / delete salary |
| POST | /api/expenses | Add expense |
| PUT/DELETE | /api/expenses/:id | Update / delete expense |
| POST | /api/investments | Add investment |
| PUT/DELETE | /api/investments/:id | Update / delete investment |
| POST | /api/activities | Add other activity |
| PUT/DELETE | /api/activities/:id | Update / delete activity |

All mutable routes scope by `userId` (from the verified Firebase token).

---

## Connect the frontend

In the **Next.js frontend** (spend-tracker-nextjs), set in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Include `/api` so that requests go to `http://localhost:3001/api/data/...`, etc.

Also set all `NEXT_PUBLIC_FIREBASE_*` variables (same Firebase project as the backend service account).

Then run frontend and backend:

- Backend: `cd spend-tracker-api && npm start`
- Frontend: `cd spend-tracker-nextjs && npm run dev`

Sign in on the frontend; it will send the Firebase ID token to the API and data will be stored in MongoDB per user.
