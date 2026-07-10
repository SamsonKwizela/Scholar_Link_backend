const express = require("express");
const { upload, uploadFile, getFile } = require("../controllers/uploadController");

const router = express.Router();

// UPLOAD FILE
router.post("/", upload.single("file"), uploadFile);

// GET FILE BY FILENAME
router.get("/:filename", getFile);

module.exports = router;