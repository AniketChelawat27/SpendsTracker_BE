const express = require("express");
const Salary = require("../models/Salary");
const Expense = require("../models/Expense");
const Investment = require("../models/Investment");
const Activity = require("../models/Activity");
const { requireAuth } = require("../middleware/auth");
const { toJSON } = require("../utils/toJSON");

const router = express.Router();
router.use(requireAuth);

/**
 * GET /data/year/:year
 * Returns all data for the user for the full year (must be before /:year/:month).
 */
router.get("/year/:year", async (req, res) => {
  try {
    const uid = req.uid;
    const year = parseInt(req.params.year, 10);
    if (Number.isNaN(year)) {
      return res.status(400).json({ error: "Invalid year" });
    }

    const [salaries, expenses, investments, activities] = await Promise.all([
      Salary.find({ userId: uid, year }).lean(),
      Expense.find({ userId: uid, year }).lean(),
      Investment.find({ userId: uid, year }).lean(),
      Activity.find({ userId: uid, year }).lean(),
    ]);

    res.json({
      salaries: toJSON(salaries),
      expenses: toJSON(expenses),
      investments: toJSON(investments),
      activities: toJSON(activities),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /data/:year/:month
 * Returns all salaries, expenses, investments, activities for the user and month.
 */
router.get("/:year/:month", async (req, res) => {
  try {
    const uid = req.uid;
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);
    if (Number.isNaN(year) || Number.isNaN(month)) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    const [salaries, expenses, investments, activities] = await Promise.all([
      Salary.find({ userId: uid, year, month }).lean(),
      Expense.find({ userId: uid, year, month }).lean(),
      Investment.find({ userId: uid, year, month }).lean(),
      Activity.find({ userId: uid, year, month }).lean(),
    ]);

    res.json({
      salaries: toJSON(salaries),
      expenses: toJSON(expenses),
      investments: toJSON(investments),
      activities: toJSON(activities),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
