const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["Mutual Fund", "FD", "Stocks", "Gold", "Crypto", "Other"],
    },
    amount: { type: Number, required: true },
    owner: { type: String, required: true },
    date: { type: String, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    returnPercent: { type: Number },
    notes: { type: String, default: "" },
    // For type "Gold": price per gram (INR) at time of purchase – used for current valuation
    pricePerGramAtPurchase: { type: Number },
  },
  { timestamps: true }
);

schema.index({ userId: 1, year: 1, month: 1 });

const Investment = mongoose.model("Investment", schema);
module.exports = Investment;
