const express = require("express");
const connectDB = require("./config/db");
const User = require("./models/User");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const scholarRoutes = require("./routes/scholarRoutes");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/scholars", scholarRoutes);

app.listen(8000, () => console.log("Server running"));
