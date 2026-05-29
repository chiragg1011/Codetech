const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { validateRegisterInput, validateLoginInput } = require("../middleware/validate");

// Auth Endpoints
router.post("/register", validateRegisterInput, registerUser);
router.post("/login", validateLoginInput, loginUser);
router.get("/me", protect, getUserProfile);

module.exports = router;
