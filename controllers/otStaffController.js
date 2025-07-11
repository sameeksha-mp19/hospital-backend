const OTRequest = require("../models/otRequestModel");
const OTSchedule = require("../models/otScheduleModel");

// @desc    Get all pending OT requests from doctors
// @route   GET /api/ot-staff/requests
const getOtRequests = async (req, res) => {
    try {
        const requests = await OTRequest.find({ status: 'Pending' }).populate('doctorId', 'name department').sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

// @desc    Get the full OT schedule/calendar
// @route   GET /api/ot-staff/schedules
const getOtSchedules = async (req, res) => {
    try {
        // Fetch schedules for the next 7 days for example
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const schedules = await OTSchedule.find({ date: { $gte: today, $lt: nextWeek } }).sort({ date: 1, startTime: 1, room: 1 });
        res.json(schedules);
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

// @desc    Assign a doctor's request to an available OT slot
// @route   PUT /api/ot-staff/assign-request
const assignOtRequest = async (req, res) => {
    const { requestId, scheduleId } = req.body;
    try {
        const request = await OTRequest.findById(requestId);
        const schedule = await OTSchedule.findById(scheduleId);

        if (!request || !schedule) return res.status(404).json({ message: "Request or Schedule not found." });
        if (schedule.status !== 'Available') return res.status(400).json({ message: "Selected OT slot is not available." });

        // Update the schedule
        schedule.status = "Booked";
        schedule.patientName = request.patientName; // Assuming patientName is on the request
        schedule.operationType = request.operationType; // Assuming this is on the request
        schedule.otRequestId = requestId;
        await schedule.save();

        // Update the request
        request.status = "Approved";
        await request.save();

        res.json({ message: "Request assigned successfully.", schedule });
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

// @desc    Book an emergency OT slot directly
// @route   POST /api/ot-staff/emergency-booking
const emergencyBooking = async (req, res) => {
    try {
        const { patientName, reason, date, startTime, endTime, room } = req.body;
        // This creates a new schedule entry directly
        const newSchedule = await OTSchedule.create({
            date, startTime, endTime, room,
            status: "Occupied", // Emergency bookings are immediately occupied
            patientName,
            operationType: reason,
            isEmergency: true
        });
        res.status(201).json(newSchedule);
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

// @desc    Update the status of an OT slot
// @route   PUT /api/ot-staff/schedules/:id
const updateScheduleStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const schedule = await OTSchedule.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!schedule) return res.status(404).json({ message: "Schedule not found" });
        res.json(schedule);
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

const findAvailableSlots = async (req, res) => {
    try {
        const { date, room } = req.query; // e.g., ?date=2025-06-08&room=OT-2
        if (!date || !room) {
            return res.status(400).json({ message: "Date and room are required to find slots." });
        }

        const searchDate = new Date(date);
        
        // Find all slots for that day and room that are marked 'Available'
        const availableSlots = await OTSchedule.find({
            date: {
                $gte: new Date(searchDate.setHours(0,0,0,0)),
                $lt: new Date(searchDate.setHours(23,59,59,999))
            },
            room: room,
            status: 'Available'
        }).sort({ startTime: 1 });

        res.json(availableSlots);

    } catch (error) {
        console.error("FIND SLOTS ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const createOtSchedule = async (req, res) => {
    try {
        const { date, startTime, endTime, room } = req.body;
        if (!date || !startTime || !endTime || !room) {
            return res.status(400).json({ message: "All fields are required to create a slot." });
        }

        // Optional: Check if a slot for this room and time already exists
        const existingSlot = await OTSchedule.findOne({ date, startTime, room });
        if (existingSlot) {
            return res.status(409).json({ message: `This exact slot for ${room} already exists.` });
        }

        const newSchedule = await OTSchedule.create({
            date, startTime, endTime, room,
            status: "Available" // New slots are always created as 'Available'
        });

        res.status(201).json(newSchedule);
    } catch (error) {
        if (error.code === 11000) { // More robust duplicate check
            return res.status(409).json({ message: `This exact slot for ${room} already exists.` });
        }
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { getOtRequests, getOtSchedules, assignOtRequest, emergencyBooking, updateScheduleStatus , findAvailableSlots , createOtSchedule};