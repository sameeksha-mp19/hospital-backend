const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes"); 
const adminRoutes = require("./routes/adminRoutes");
const pharmacyRoutes = require("./routes/pharmacyRoutes");

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
// app.use(cors()); // Allows cross-origin requests

const allowedOrigins = [
  'http://localhost:3000', // For local development
  'https://hospital-frontend-lovat.vercel.app/' // Your live frontend URL
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
app.use(express.json()); // Allows parsing of JSON request bodies

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// API Routes
app.get("/", (req, res) => {
    res.send("Hospital Management System API is running...");
});

app.use("/api/auth", authRoutes);
// You will add more routes here later
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use("/api/admin", adminRoutes); 
console.log("Attempting to load pharmacy routes...");
app.use("/api/pharmacy", pharmacyRoutes); 
app.use("/api/ot-staff", require("./routes/otStaffRoutes"));

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});