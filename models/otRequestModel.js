const mongoose = require("mongoose");

const otRequestSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // Storing as string e.g., "14:00" for simplicity
      required: true,
    },
    endTime: {
      type: String, // e.g., "16:00"
      required: true,
    },
    // The OT Staff will manage the actual patient and procedure details
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const OTRequest = mongoose.model("OTRequest", otRequestSchema);

module.exports = OTRequest;