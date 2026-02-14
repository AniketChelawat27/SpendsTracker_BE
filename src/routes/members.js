const express = require("express");
const Member = require("../models/Member");
const { requireAuth } = require("../middleware/auth");
const { toJSON } = require("../utils/toJSON");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const list = await Member.find({ userId: req.uid }).sort({ createdAt: 1 }).lean();
    res.json(toJSON(list));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "name is required" });
    }
    const doc = await Member.create({
      userId: req.uid,
      name: String(name).trim(),
    });
    res.status(201).json(toJSON(doc));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const doc = await Member.findOneAndDelete({
    _id: req.params.id,
    userId: req.uid,
  });
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

module.exports = router;
