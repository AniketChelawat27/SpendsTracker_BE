const express = require("express");
const Salary = require("../models/Salary");
const { requireAuth } = require("../middleware/auth");
const { toJSON } = require("../utils/toJSON");

const router = express.Router();
router.use(requireAuth);

router.post("/", async (req, res) => {
  try {
    const doc = await Salary.create({ ...req.body, userId: req.uid });
    res.status(201).json(toJSON(doc));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const doc = await Salary.findOneAndUpdate(
      { _id: req.params.id, userId: req.uid },
      req.body,
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(toJSON(doc));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const doc = await Salary.findOneAndDelete({
    _id: req.params.id,
    userId: req.uid,
  });
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

module.exports = router;
