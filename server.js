const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/db");
const User = require("./models/User");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const scholarRoutes = require("./routes/scholarRoutes");
const scholarshipRoutes = require("./routes/scholarshipRoutes");
const scholarshipApplicationRoutes = require("./routes/scholarshipApplicationRoutes");
const userRoutes = require("./routes/userRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const assessmentAttemptRoutes = require("./routes/assessmentAttemptRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/scholars", scholarRoutes);
app.use("/api/scholarships", scholarshipRoutes);
app.use("/api/profile", userRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/assessment-attempts", assessmentAttemptRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));

app.listen(8000, () => console.log("Server running on port 8000"));