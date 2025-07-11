const mongoose = require("mongoose");

const protocolSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  active: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Protocol", protocolSchema);