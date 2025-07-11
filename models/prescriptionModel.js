const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Appointment" },
  date: { type: Date, default: Date.now },
  diagnosis: { type: String, required: true },
  
  // This is the correct schema for a single prescribed medicine
  drugName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  
  status: { type: String, enum: ["Pending", "Dispensed"], default: "Pending" },
}, { timestamps: true });

module.exports = mongoose.model("Prescription", prescriptionSchema);
