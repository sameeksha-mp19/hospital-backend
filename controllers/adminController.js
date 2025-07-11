const User = require("../models/userModel");
const Appointment = require("../models/appointmentModel");
const Prescription = require("../models/prescriptionModel");
const Protocol = require("../models/protocolModel");
const Notification = require("../models/notificationModel");
const AuditLog = require("../models/auditLogModel");
const bcrypt = require("bcryptjs");

// Helper to create an audit log
const createAuditLog = async (actorName, action) => {
  try {
    await AuditLog.create({ actor: actorName, action });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
};

// @desc    Register a new user (by an Admin)
// @route   POST /api/admin/register-user
const registerUserByAdmin = async (req, res) => {
  const { name, email, password, role, department } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Name, email, password, and role are required." });
  }
  if (role === 'Doctor' && !department) {
    return res.status(400).json({ message: "Department is required for doctors." });
  }
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name, email, password: hashedPassword, role,
      department: role === 'Doctor' ? department : undefined,
    });
    
    // Create Audit Log
    await createAuditLog(req.user.name, `Created a new ${role} user: ${name}.`);

    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get hospital-wide statistics
// @route   GET /api/admin/stats
const getHospitalStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const doctorsOnDuty = await User.countDocuments({ role: 'Doctor' }); // Simplified logic
        const patientsAdmitted = await Appointment.countDocuments({ createdAt: { $gte: today } });
        const pharmacyOrders = await Prescription.countDocuments({ createdAt: { $gte: today } });
        const emergenciesToday = await Appointment.countDocuments({ priority: 'Emergency', appointmentDate: { $gte: today }});

        res.json({
            doctorsOnDuty,
            patientsAdmitted,
            pharmacyOrders,
            emergenciesToday
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all emergency protocols
// @route   GET /api/admin/protocols
const getProtocols = async (req, res) => {
    try {
        const protocols = await Protocol.find({});
        res.json(protocols);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a new emergency protocol
// @route   POST /api/admin/protocols
const addProtocol = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newProtocol = await Protocol.create({ name, description });
        await createAuditLog(req.user.name, `Added new protocol: ${name}.`);
        res.status(201).json(newProtocol);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a protocol's status
// @route   PUT /api/admin/protocols/:id
const updateProtocolStatus = async (req, res) => {
    try {
        const protocol = await Protocol.findById(req.params.id);
        if (!protocol) {
            return res.status(404).json({ message: 'Protocol not found' });
        }
        protocol.active = !protocol.active;
        await protocol.save();
        await createAuditLog(req.user.name, `${protocol.active ? 'Activated' : 'Deactivated'} protocol: ${protocol.name}.`);
        res.json(protocol);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Send a global notification
// @route   POST /api/admin/notifications
const sendNotification = async (req, res) => {
    try {
        const { message, target } = req.body;
        const notification = await Notification.create({ message, target, createdBy: req.user._id });
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all audit logs
// @route   GET /api/admin/audit-logs
const getAuditLogs = async (req, res) => {
    try {
        // Get last 50 logs, sorted by most recent
        const logs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(50);
        res.json(logs);
    } catch(error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { 
    registerUserByAdmin, 
    getUsers, 
    getHospitalStats,
    getProtocols,
    addProtocol,
    updateProtocolStatus,
    sendNotification,
    getAuditLogs,
};