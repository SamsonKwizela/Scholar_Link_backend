const express = require("express");

const {
  createScholar,
  getScholars,
  getScholarById,
} = require("../controllers/scholarController");

const router = express.Router();


// ADMIN ROUTE (create scholar)
router.post("/create", createScholar);


// USER ROUTES (view scholars)
router.get("/", getScholars);
router.get("/:id", getScholarById);

module.exports = router;