const express = require("express");
const router = express.Router();
const { 
    getOtRequests,
    getOtSchedules,
    assignOtRequest,
    emergencyBooking,
    updateScheduleStatus,
    findAvailableSlots,
    createOtSchedule,
} = require("../controllers/otStaffController");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected
router.use(protect);

router.get('/requests', getOtRequests);
router.get('/schedules', getOtSchedules);
router.put('/assign-request', assignOtRequest);
router.post('/emergency-booking', emergencyBooking);
router.put('/schedules/:id', updateScheduleStatus);
router.get('/find-slots', findAvailableSlots); 
router.post('/schedules', createOtSchedule);



module.exports = router;