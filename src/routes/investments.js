const express = require("express");
const Investment = require("../models/Investment");
const { requireAuth } = require("../middleware/auth");
const { toJSON } = require("../utils/toJSON");
const { fetchCurrentGoldPriceInrPerGram } = require("../services/goldPrice");

const router = express.Router();
router.use(requireAuth);

/**
 * GET /api/investments/gold-valuation
 * Returns current gold price (INR/gram) and current valuation of all gold investments.
 * Uses OpenAI to fetch current gold price; for each Gold entry with pricePerGramAtPurchase
 * we compute quantity and current value.
 */
router.get("/gold-valuation", async (req, res) => {
  try {
    const currentPricePerGram = await fetchCurrentGoldPriceInrPerGram();
    const goldInvestments = await Investment.find({
      userId: req.uid,
      type: "Gold",
    }).sort({ date: -1 });

    let totalInvested = 0;
    let totalCurrentValue = 0;
    const items = goldInvestments.map((inv) => {
      const amount = inv.amount || 0;
      totalInvested += amount;
      const priceAtPurchase = inv.pricePerGramAtPurchase;
      let quantityGrams = null;
      let currentValue = null;
      if (priceAtPurchase != null && priceAtPurchase > 0) {
        quantityGrams = amount / priceAtPurchase;
        currentValue = Math.round(quantityGrams * currentPricePerGram * 100) / 100;
        totalCurrentValue += currentValue;
      }
      return {
        ...toJSON(inv),
        quantityGrams: quantityGrams != null ? Math.round(quantityGrams * 1000) / 1000 : null,
        currentValue,
      };
    });

    res.json({
      currentPricePerGram,
      totalInvested,
      totalCurrentValue: totalCurrentValue || null,
      items,
    });
  } catch (err) {
    console.error("Gold valuation error:", err.message);
    res.status(500).json({
      error: "Failed to fetch gold valuation",
      detail: err.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const doc = await Investment.create({ ...req.body, userId: req.uid });
    res.status(201).json(toJSON(doc));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const doc = await Investment.findOneAndUpdate(
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
  const doc = await Investment.findOneAndDelete({
    _id: req.params.id,
    userId: req.uid,
  });
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

module.exports = router;
