const Appointment = require("../models/appointmentModel");
const Prescription = require("../models/prescriptionModel");
const OTRequest = require("../models/otRequestModel");
const drugModel = require("../models/drugModel");

// @desc    Get the patient queue for the logged-in doctor
// @route   GET /api/doctor/queue
// @access  Private
const getDoctorQueue = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: "Scheduled",
    }).sort({ priority: -1, tokenNumber: 1 });

    const emergencies = appointments.filter(a => a.priority === 'Emergency');
    const queue = appointments.filter(a => a.priority === 'Normal');

    res.json({ emergencies, queue });
  } catch (error) {
    console.error("GET QUEUE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update an appointment status to "Serving"
// @route   POST /api/doctor/call-next
// @access  Private
const callNextPatient = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const doctorId = req.user._id;

        // The permanent, self-healing fix for the "stuck patient" problem
        await Appointment.updateMany(
            { doctorId: doctorId, status: 'Serving' },
            { $set: { status: 'Scheduled' } }
        );

        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status: "Serving" },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found." });
        }
        res.json(appointment);
    } catch (error) {
        console.error("CALL NEXT ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Submit a prescription and complete an appointment
// @route   POST /api/doctor/prescriptions
// @access  Private
const submitPrescription = async (req, res) => {
    try {
        const { patientId, appointmentId, diagnosis, medicines } = req.body;
        const doctorId = req.user._id;

        if (!patientId || !appointmentId || !diagnosis || !medicines || medicines.length === 0) {
            return res.status(400).json({ message: "Missing required prescription data." });
        }

        // Correctly creates a SINGLE prescription document with an array of medicines
           
            for (const med of medicines) {
        // For each medicine, we create a new, separate prescription document
        // that perfectly matches our new schema.
        await Prescription.create({
            patientId,
            doctorId,
            appointmentId,
            diagnosis,
            drugName: med.name,     // Use the required 'drugName' field
            quantity: med.quantity, // Use the required 'quantity' field
            status: "Pending",
        });
    }
        
        await Appointment.findByIdAndUpdate(appointmentId, { status: "Completed" });

        res.status(201).json({ message: "Prescription created successfully." });

    } catch (error) {
        console.error("SUBMIT PRESCRIPTION ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Request a new OT Slot
// @route   POST /api/doctor/request-ot
// @access  Private
const requestOtSlot = async (req, res) => {
  const { date, startTime, endTime } = req.body;
  const doctorId = req.user._id;

  if (!date || !startTime || !endTime) {
    return res.status(400).json({ message: "Date, start time, and end time are required." });
  }
  try {
    const newRequest = await OTRequest.create({ doctorId, date, startTime, endTime });
    res.status(201).json(newRequest);
  } catch (error) {
    console.error("OT REQUEST ERROR:", error);
    res.status(500).json({ message: "Server error while requesting OT slot." });
  }
};

// @desc    Cancel the current session and revert status to Scheduled
// @route   PUT /api/doctor/cancel-serving
// @access  Private
const cancelServing = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        if (!appointmentId) {
            return res.status(400).json({ message: "Appointment ID is required." });
        }
        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status: "Scheduled" },
            { new: true }
        );
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found or already processed." });
        }
        res.json({ message: "Session cancelled successfully. Patient returned to queue." });
    } catch (error) {
        console.error("CANCEL SERVING ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get the doctor's currently serving patient, if any
// @route   GET /api/doctor/current-session
// @access  Private
const getCurrentSession = async (req, res) => {
    try {
        const doctorId = req.user._id;
        const currentlyServing = await Appointment.findOne({ doctorId, status: 'Serving' });
        res.json(currentlyServing);
    } catch (error) {
        console.error("GET CURRENT SESSION ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
  getDoctorQueue,
  callNextPatient,
  submitPrescription,
  requestOtSlot,
  cancelServing,
  getCurrentSession,
};