const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    person: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

schema.index({ userId: 1, year: 1, month: 1 });

const Salary = mongoose.model("Salary", schema);
module.exports = Salary;
