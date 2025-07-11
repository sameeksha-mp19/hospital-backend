const mongoose = require("mongoose");

const otScheduleSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String, required: true, enum: ["OT-1", "OT-2", "OT-3", "OT-4", "OT-5"] },
  status: { type: String, enum: ["Available", "Booked", "Occupied", "Unavailable"], default: "Available" },
  
  // Details for when the slot is booked
  patientName: { type: String },
  operationType: { type: String },
  isEmergency: { type: Boolean, default: false },

  // Link to the original doctor's request if it exists
  otRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'OTRequest' },

}, { timestamps: true });

// Prevent booking the same room at the same time
otScheduleSchema.index({ room: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model("OTSchedule", otScheduleSchema);