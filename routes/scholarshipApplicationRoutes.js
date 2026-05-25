const express = require("express");

const {
  applyScholarship,
} = require(
  "../controllers/scholarshipApplicationController"
);

const upload = require("../middleware/upload");

const router = express.Router();


// APPLY FOR SCHOLARSHIP
router.post(
  "/apply",
  upload.array("documents", 5),
  applyScholarship
);

module.exports = router;