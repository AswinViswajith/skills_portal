const express = require("express");
const router = express.Router();
const { googleSignIn, validateToken } = require("../controllers/authController");

// Google Sign-In Route
router.post("/google", googleSignIn);

// Validate Token Route
router.post("/validate-token", validateToken);

module.exports = router;

