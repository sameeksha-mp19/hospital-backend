const express = require("express");
const router = express.Router();
const {  registerUserByAdmin, 
    getUsers,
    getHospitalStats,
    getProtocols,
    addProtocol,
    updateProtocolStatus,
    sendNotification,
    getAuditLogs, } = require("../controllers/adminController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// All routes in this file are protected and require the user to be an Admin.
// `protect` runs first, then `isAdmin` runs next.
router.use(protect, isAdmin);

// Route to register a new user (e.g., a doctor)
router.post("/register-user", registerUserByAdmin);

// Route to get a list of all users
router.get("/users", getUsers);

// Hospital Stats Route
router.get("/stats", getHospitalStats);

// Emergency Protocols Routes
router.get("/protocols", getProtocols);
router.post("/protocols", addProtocol);
router.put("/protocols/:id", updateProtocolStatus);

// Global Notifications Route
router.post("/notifications", sendNotification);

// Audit Logs Route
router.get("/audit-logs", getAuditLogs);

module.exports = router;