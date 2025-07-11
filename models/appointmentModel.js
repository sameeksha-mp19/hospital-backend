const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // A doctor is required for an appointment
      ref: "User",
    },
    patientName: {
      type: String,
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    // ✅ NEW FIELD
    reason: {
      type: String,
      default: 'Consultation'
    },
    // ✅ NEW FIELD
    priority: {
      type: String,
      enum: ['Normal', 'Emergency'],
      default: 'Normal'
    },
    status: {
      type: String,
      enum: ["Scheduled", "Serving", "Completed", "Cancelled"],
      default: "Scheduled",
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;