const express = require("express");
const router = express.Router();
const {
bookToken,
getPatientStatus,
getPrescriptionHistory,
} = require("../controllers/patientController");
const { protect } = require("../middleware/authMiddleware");
// All routes in this file are protected and require a valid token
router.use(protect);
// Your frontend BookToken.jsx hits /api/token/book, so we'll adjust the main route in server.js
// For now, let's define the specific paths.
router.post("/book-token", bookToken);
router.get("/status", getPatientStatus);
router.get("/prescriptions", getPrescriptionHistory);
module.exports = router;