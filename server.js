const express = require("express");
const connectDB = require("./config/db");
const User = require("./models/user");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// CONNECT DB
connectDB();

// ROUTES (must be BEFORE listen)
app.post("/api/users", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("API running ");
});

app.listen(5000, () => console.log("Server running"));

app.get("/", (req, res) => {
  res.send("ScholarLink API is running");
});