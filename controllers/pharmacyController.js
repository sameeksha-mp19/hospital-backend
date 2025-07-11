const Prescription = require("../models/prescriptionModel");
const Drug = require("../models/drugModel");

const getPendingPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ status: "Pending" }).populate("patientId", "name").sort({ createdAt: 1 });
    res.json(prescriptions);
  } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

const dispensePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ message: "Prescription not found." });
    if (prescription.status === 'Dispensed') return res.status(400).json({ message: 'This has already been dispensed.' });

    // The logic is now simpler and does not need a loop.
    // It correctly uses the `drugName` and `quantity` fields from the prescription document.
       await Drug.updateOne(
      { name: prescription.drugName },
      { $inc: { stock: -prescription.quantity } }
    );
    
    // Update prescription status
    prescription.status = "Dispensed";
    await prescription.save();

    res.json({ message: "Prescription dispensed successfully." });
  } catch (error) {
    console.error("DISPENSE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getInventory = async (req, res) => {
  try {
    const inventory = await Drug.find({}).sort({ name: 1 });
    res.json(inventory);
  } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

const restockDrug = async (req, res) => {
    try {
        const { quantity } = req.body;
        if (!quantity || quantity <= 0) return res.status(400).json({ message: "Valid quantity is required." });
        
        const drug = await Drug.findByIdAndUpdate( req.params.id, { $inc: { stock: quantity } }, { new: true });
        if (!drug) return res.status(404).json({ message: "Drug not found." });
        res.json(drug);
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

// This is a one-time function to add initial drugs to the database
const seedDrugs = async (req, res) => {
    try {
        const initialDrugs = [
            { name: "Paracetamol", stock: 100, expiryDate: new Date("2025-01-30") },
            { name: "Amoxicillin", stock: 50, expiryDate: new Date("2024-11-15") },
            { name: "Cetrizine", stock: 75, expiryDate: new Date("2024-08-01") },
            { name: "Ibuprofen", stock: 120, expiryDate: new Date("2026-05-01") },
            { name: "Dolo 650", stock: 40, expiryDate: new Date("2025-09-30") },
        ];
        // Using insertMany and ordered:false to prevent crash if one drug already exists
        await Drug.insertMany(initialDrugs, { ordered: false });
        res.status(201).json({ message: "Drug inventory seeded successfully!" });
    } catch (error) {
        // We expect a potential duplicate key error if run twice, which is fine.
        if (error.code === 11000) {
            return res.status(200).json({ message: "Inventory has likely already been seeded." });
        }
        res.status(500).json({ message: 'Server Error', error });
    }
};

const searchDrugs = async (req, res) => {
    try {
        const searchQuery = req.query.q; // Get search term from query parameter ?q=...

        if (!searchQuery) {
            return res.json([]);
        }

        // Use a regular expression for a case-insensitive "starts with" search
        const drugs = await Drug.find({
            name: new RegExp('^' + searchQuery, 'i')
        }).limit(10); // Limit results to 10 to not overwhelm the UI

        res.json(drugs);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { getPendingPrescriptions, dispensePrescription, getInventory, restockDrug, seedDrugs, searchDrugs, };