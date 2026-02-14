# MongoDB Compass – Setup for Spend Tracker API

Use MongoDB Compass to create the database and (optionally) inspect data. The API creates collections automatically when you first add data; you can still set up the DB and indexes in Compass if you prefer.

---

## 1. Install MongoDB (if not already)

- **Mac (Homebrew):** `brew tap mongodb/brew && brew install mongodb-community`
- **Windows:** [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- **Atlas:** Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and get a connection string.

Start the local server (if not using Atlas):

- Mac: `brew services start mongodb-community`
- Or run: `mongod --config /usr/local/etc/mongod.conf` (path may vary)

---

## 2. Open Compass and connect

1. Open **MongoDB Compass**.
2. **New Connection.** Use one of:
   - **Local:** `mongodb://localhost:27017`
   - **Atlas:** paste the connection string from your cluster (e.g. `mongodb+srv://user:pass@cluster.xxxxx.mongodb.net`).
3. Click **Connect**.

---

## 3. Create the database

1. Click **Create Database**.
2. **Database Name:** `spend-tracker`
3. **Collection Name:** you can leave empty or use `salaries` (a first collection).  
   The API will create these when data is first written:
   - `salaries`
   - `expenses`
   - `investments`
   - `activities`
   - `members`
   - `funds`
4. Click **Create Database**.

---

## 4. Connection string for the API

In the API `.env`:

- **Local:**  
  `MONGODB_URI=mongodb://localhost:27017/spend-tracker`
- **Atlas:**  
  `MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.xxxxx.mongodb.net/spend-tracker?retryWrites=true&w=majority`  
  (replace `USER`, `PASSWORD`, `CLUSTER` with your values; add DB name before `?` if not in the string.)

---

## 5. (Optional) Indexes

The API uses Mongoose and will create indexes from the model definitions. If you want to create or check them in Compass:

1. Select the `spend-tracker` database.
2. Open a collection (e.g. `salaries`).
3. Go to the **Indexes** tab.
4. You can create indexes manually, for example:
   - **salaries:** `{ userId: 1, year: 1, month: 1 }`
   - **expenses:** same
   - **investments:** same
   - **activities:** same
   - **members:** `{ userId: 1 }`
   - **funds:** `{ userId: 1 }` (unique)

Or just run the API and add data; Mongoose will create the indexes on first use.

---

## 6. Verify

1. Start the API: `npm start` (with correct `.env`).
2. From the frontend (or Postman), sign in and add a salary/member.
3. In Compass, open `spend-tracker` → the relevant collection and confirm new documents appear (each has a `userId` field from Firebase).
