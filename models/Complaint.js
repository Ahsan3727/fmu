const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  originalName: String,
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
});

const complaintSchema = new mongoose.Schema(
  {
    // ── Student Info ──────────────────────────────────
    name: {
      type: String,
      required: [true, "Naam zaroori hai"],
      trim: true,
      maxlength: [100, "Naam 100 characters se zyada nahi ho sakta"],
    },
    rollNumber: {
      type: String,
      required: [true, "Roll number zaroori hai"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department select karein"],
      enum: ["OTT", "RIT", "MLT", "RD", "VS", "CP", "RT"],
    },

    // ── Complaint ─────────────────────────────────────
    complaint: {
      type: String,
      required: [true, "Complaint likhna zaroori hai"],
      minlength: [20, "Complaint kam az kam 20 characters ki honi chahiye"],
    },

    // ── Evidence Files ────────────────────────────────
    files: [fileSchema],

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: ["Pending", "Under Review", "Resolved", "Rejected"],
      default: "Pending",
    },

    // ── Tracking ID (public ke liye) ──────────────────
    trackingId: {
      type: String,
      unique: true,
    },

    // ── Admin Notes ───────────────────────────────────
    adminNotes: {
      type: String,
      default: "",
    },

    // ── Priority ──────────────────────────────────────
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Emergency"],
      default: "Medium",
    },

    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto
  }
);

// Tracking ID auto generate
complaintSchema.pre("save", function (next) {
  if (!this.trackingId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    this.trackingId = `FMU-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model("Complaint", complaintSchema);
