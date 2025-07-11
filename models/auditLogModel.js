const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  actor: { type: String, required: true }, // Name of the user performing the action
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AuditLog", auditLogSchema);