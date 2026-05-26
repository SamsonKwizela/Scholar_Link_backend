const express = require("express");

const {
  createScholar,
  getScholars,
  getScholarById,
  updateScholar,
  deleteScholar,
} = require("../controllers/scholarController");

const router = express.Router();

// ADMIN ROUTE (create scholar)
router.post("/create", createScholar);

// USER ROUTES (view scholars)
router.get("/", getScholars);
router.get("/:id", getScholarById);

// UPDATE
router.put("/update/:id", updateScholar);

// DELETE
router.delete("/delete/:id", deleteScholar);

module.exports = router;
