# Add Firebase Admin to backend .env

The API needs Firebase Admin to verify the frontend’s sign-in token. Without it, all protected routes return **503 Auth not configured**.

## Option A: Service account file (simple for local)

1. Firebase Console → your project → **Project settings** (gear) → **Service accounts**.
2. Click **Generate new private key** and download the JSON.
3. Save it in the backend repo root as `serviceAccountKey.json`.
4. In `.env` add:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
   ```
5. Restart the backend: `npm start`.

## Option B: Paste JSON in .env (good for production / no file)

1. Download the service account JSON as above.
2. Minify it to one line. On your machine:
   ```bash
   node -e "console.log(JSON.stringify(require('./serviceAccountKey.json')))"
   ```
3. Copy the output and in `.env` add:
   ```
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
   ```
   Paste the **entire** line (no newlines). Restart the backend.

Use the **same Firebase project** as your frontend (same project ID and web app config in the Next.js `.env.local`).
