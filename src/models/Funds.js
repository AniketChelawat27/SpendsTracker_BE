const mongoose = require("mongoose");

const fundGoalSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    target: { type: Number, default: 0 },
    current: { type: Number, default: 0 },
  },
  { _id: false }
);

const schema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    emergency: { type: fundGoalSchema, default: () => ({}) },
    vacation: { type: fundGoalSchema, default: () => ({}) },
  },
  { timestamps: true }
);

const Funds = mongoose.model("Funds", schema);
module.exports = Funds;
