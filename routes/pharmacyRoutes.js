const express = require("express");
const router = express.Router();
const { 
    getPendingPrescriptions, 
    dispensePrescription, 
    getInventory, 
    restockDrug, 
    seedDrugs, // <-- Ensure seedDrugs is imported
    searchDrugs,
} = require("../controllers/pharmacyController");

const { protect } = require("../middleware/authMiddleware");
// Route to seed initial drug data. Can be removed after first run.
//router.post("/seed", seedDrugs); 

// Protect all other pharmacy routes
router.use(protect);

router.get("/prescriptions", getPendingPrescriptions);
router.put("/prescriptions/:id/dispense", dispensePrescription);
router.get("/inventory", getInventory);
router.put("/inventory/:id/restock", restockDrug);
router.get("/search", searchDrugs);

module.exports = router;