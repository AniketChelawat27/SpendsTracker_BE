const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      required: true,
      enum: ["Income", "Gift", "Loan", "Transfer", "Other"],
    },
    person: { type: String, required: true },
    date: { type: String, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

schema.index({ userId: 1, year: 1, month: 1 });

const Activity = mongoose.model("Activity", schema);
module.exports = Activity;
