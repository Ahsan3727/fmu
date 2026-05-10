const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const { protect } = require("../middleware/auth");
const {
  submitComplaint,
  trackComplaint,
  getAllComplaints,
  getComplaint,
  updateComplaint,
  deleteComplaint,
  getStats,
} = require("../controllers/complaintController");

// Multer ke liye complaint ID middleware
const setComplaintId = (req, res, next) => {
  req.complaintId = "temp";
  next();
};

// ── Public Routes ──────────────────────────────────────
// POST   /api/complaints          → Submit complaint with files
router.post("/", setComplaintId, upload.array("files", 5), submitComplaint);

// GET    /api/complaints/track/:id → Track by tracking ID
router.get("/track/:trackingId", trackComplaint);

// ── Private Routes (Admin only) ───────────────────────
// GET    /api/complaints/stats    → Dashboard stats
router.get("/stats", protect, getStats);

// GET    /api/complaints           → All complaints (with filters)
router.get("/", protect, getAllComplaints);

// GET    /api/complaints/:id       → Single complaint
router.get("/:id", protect, getComplaint);

// PUT    /api/complaints/:id       → Update status/priority
router.put("/:id", protect, updateComplaint);

// DELETE /api/complaints/:id       → Delete complaint + files
router.delete("/:id", protect, deleteComplaint);

module.exports = router;
