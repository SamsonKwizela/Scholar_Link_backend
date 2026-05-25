const express = require("express");
const connectDB = require("./config/db");
const User = require("./models/User");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const scholarRoutes = require("./routes/scholarRoutes");
const scholarshipRoutes = require("./routes/scholarshipRoutes");
const scholarshipApplicationRoutes = require("./routes/scholarshipApplicationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/scholars", scholarRoutes);
app.use("/api/scholarships", scholarshipRoutes);
app.use("/api/applications", scholarshipApplicationRoutes);

app.listen(8000, () => console.log("Server running"));
