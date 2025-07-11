const mongoose = require("mongoose");

const drugSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  stock: { type: Number, required: true, default: 0 },
  expiryDate: { type: Date },
  lowStockThreshold: { type: Number, default: 20 },
}, { timestamps: true });

module.exports = mongoose.model("Drug", drugSchema);