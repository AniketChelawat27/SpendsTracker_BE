const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Member = mongoose.model("Member", schema);
module.exports = Member;
