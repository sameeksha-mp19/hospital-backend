const Appointment = require("../models/appointmentModel");
const Prescription = require("../models/prescriptionModel");
const User = require("../models/userModel");

// @desc    Book a new token/appointment
// @route   POST /api/patient/book-token
// @access  Private
const bookToken = async (req, res) => {
  const { patientName, department, date, doctorName } = req.body;
  const patientId = req.user._id; // from auth middleware

  if (!patientName || !department || !date || !doctorName) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  try {
    // Find the doctor to get their ID
    const doctor = await User.findOne({ name: doctorName, role: 'Doctor' });
    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
    }

    // Generate a new token number for the given department and date
    // This logic finds the highest existing token for that day and adds 1
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const latestAppointment = await Appointment.findOne({
      department,
      appointmentDate: { $gte: today, $lt: tomorrow },
    }).sort({ tokenNumber: -1 });

    const tokenNumber = latestAppointment ? latestAppointment.tokenNumber + 1 : 1;

    const appointment = await Appointment.create({
      patientId,
      doctorId: doctor._id,
      patientName,
      doctorName,
      department,
      appointmentDate: date,
      tokenNumber,
      status: "Scheduled",
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("BOOK TOKEN ERROR: ", error);
    res.status(500).json({ message: "Server error while booking token." });
  }
};

// @desc    Get patient's queue status
// @route   GET /api/patient/status
// @access  Private
const getPatientStatus = async (req, res) => {
    try {
        const patientId = req.user._id;

        // Find the patient's most recent active appointment
        const myAppointment = await Appointment.findOne({ 
            patientId, 
            status: { $in: ["Scheduled", "Serving"] }
        }).sort({ createdAt: -1 });

        if (!myAppointment) {
            return res.json({ yourToken: null });
        }

        const { department, tokenNumber, appointmentDate } = myAppointment;
        
        const today = new Date(appointmentDate);
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Find the token currently being served in that department
        const servingAppointment = await Appointment.findOne({ 
            department, 
            status: "Serving",
            appointmentDate: { $gte: today, $lt: tomorrow }
        });

        // Find all appointments ahead of the patient in the queue
        const appointmentsAhead = await Appointment.find({
            department,
            status: "Scheduled",
            appointmentDate: { $gte: today, $lt: tomorrow },
            tokenNumber: { $lt: tokenNumber }
        });

        res.json({
            department,
            yourToken: tokenNumber,
            currentServing: servingAppointment ? servingAppointment.tokenNumber : "N/A",
            positionInQueue: myAppointment.status === 'Serving' ? 'Serving' : appointmentsAhead.length + 1,
        });

    } catch (error) {
        console.error("GET STATUS ERROR: ", error);
        res.status(500).json({ message: "Server error fetching status." });
    }
};

// @desc    Get patient's prescription history
// @route   GET /api/patient/prescriptions
// @access  Private
const getPrescriptionHistory = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ patientId: req.user._id })
            .populate('doctorId', 'name') // 'Populate' gets the doctor's name from the User model
            .sort({ date: -1 });

        res.json(prescriptions);
    } catch (error) {
        console.error("GET PRESCRIPTIONS ERROR: ", error);
        res.status(500).json({ message: "Server error fetching prescriptions." });
    }
};


module.exports = {
  bookToken,
  getPatientStatus,
  getPrescriptionHistory,
};