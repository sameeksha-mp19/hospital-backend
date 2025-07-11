const express = require("express");
const router = express.Router();
const {
  getDoctorQueue,
  callNextPatient,
  submitPrescription,
  requestOtSlot,
  cancelServing,
  getCurrentSession,
} = require("../controllers/doctorController");
const { protect } = require("../middleware/authMiddleware");

// Protect all routes in this file
router.use(protect);

router.get("/queue", getDoctorQueue);
router.post("/call-next", callNextPatient);
router.put("/cancel-serving", cancelServing);
router.post("/prescriptions", submitPrescription);
router.post("/request-ot", requestOtSlot); 
router.get("/current-session", getCurrentSession);

module.exports = router;