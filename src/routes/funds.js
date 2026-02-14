const express = require("express");
const Funds = require("../models/Funds");
const { requireAuth } = require("../middleware/auth");
const { toJSON } = require("../utils/toJSON");

const router = express.Router();
router.use(requireAuth);

const defaultFunds = {
  emergency: { enabled: false, target: 0, current: 0 },
  vacation: { enabled: false, target: 0, current: 0 },
};

router.get("/", async (req, res) => {
  try {
    let doc = await Funds.findOne({ userId: req.uid }).lean();
    if (!doc) {
      doc = await Funds.create({
        userId: req.uid,
        ...defaultFunds,
      });
    }
    const { userId, _id, ...rest } = doc;
    res.json({
      emergency: rest.emergency || defaultFunds.emergency,
      vacation: rest.vacation || defaultFunds.vacation,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/", async (req, res) => {
  try {
    const { emergency, vacation } = req.body;
    let doc = await Funds.findOne({ userId: req.uid });
    if (!doc) {
      doc = await Funds.create({
        userId: req.uid,
        emergency: defaultFunds.emergency,
        vacation: defaultFunds.vacation,
      });
    }
    if (emergency != null) doc.emergency = { ...doc.emergency, ...emergency };
    if (vacation != null) doc.vacation = { ...doc.vacation, ...vacation };
    await doc.save();
    const out = doc.toObject();
    res.json({
      emergency: out.emergency,
      vacation: out.vacation,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
