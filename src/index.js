require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { connectDB } = require("./config/db");

const authRoutes = require("./routes/auth");
const dataRoutes = require("./routes/data");
const salaryRoutes = require("./routes/salary");
const expensesRoutes = require("./routes/expenses");
const investmentsRoutes = require("./routes/investments");
const activitiesRoutes = require("./routes/activities");
const membersRoutes = require("./routes/members");
const fundsRoutes = require("./routes/funds");

const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// Firebase Admin (verify frontend ID tokens)
// ---------------------------------------------------------------------------
let firebaseReady = false;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
    firebaseReady = true;
    console.log("✅ Firebase Admin (application default)");
  } catch (e) {
    console.error("Firebase init:", e.message);
  }
}
if (!firebaseReady && process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const cred = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({ credential: admin.credential.cert(cred) });
    firebaseReady = true;
    console.log("✅ Firebase Admin (env JSON)");
  } catch (e) {
    console.error("Firebase init:", e.message);
  }
}
if (!firebaseReady) {
  const root = path.join(__dirname, "..");
  const keyPath = path.join(root, "serviceAccountKey.json");
  let keyFile = keyPath;
  if (!fs.existsSync(keyPath)) {
    const files = fs.readdirSync(root);
    const found = files.find(
      (f) =>
        f.endsWith(".json") &&
        f.includes("firebase") &&
        f.includes("adminsdk")
    );
    if (found) keyFile = path.join(root, found);
  }
  if (fs.existsSync(keyFile)) {
    try {
      const cred = JSON.parse(fs.readFileSync(keyFile, "utf8"));
      admin.initializeApp({ credential: admin.credential.cert(cred) });
      firebaseReady = true;
      console.log("✅ Firebase Admin:", path.basename(keyFile));
    } catch (e) {
      console.error("Firebase init:", e.message);
    }
  }
}
if (!firebaseReady) {
  console.warn(
    "⚠️ Firebase not configured. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT. See README."
  );
}

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/investments", investmentsRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/funds", fundsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
async function start() {
  await connectDB();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 API running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
