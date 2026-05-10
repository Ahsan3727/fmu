const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { login, getMe, setupAdmin } = require("../controllers/authController");

// POST /api/auth/setup   → First time superadmin create (ek baar)
router.post("/setup", setupAdmin);

// POST /api/auth/login   → Admin login
router.post("/login", login);

// GET  /api/auth/me      → Current admin info
router.get("/me", protect, getMe);

module.exports = router;
