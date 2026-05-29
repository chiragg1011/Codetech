const express = require("express");
const router = express.Router();
const { updateSettings } = require("../controllers/setController");
const { protect } = require("../middleware/auth");

// Protected Settings Endpoint
router.put("/", protect, updateSettings);

module.exports = router;
