const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Routes
const complaintRoutes = require("./routes/complaints");
const authRoutes = require("./routes/auth");

// Load env
dotenv.config();

// DB Connect
connectDB();

const app = express();

// ── Rate Limiting ──────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: "Bahut zyada requests. 15 minute baad try karein." },
});

const complaintLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Sirf 5 complaints per hour per IP
  message: { success: false, message: "1 ghante mein sirf 5 complaints submit kar sakte hain." },
});

// ── Middleware ─────────────────────────────────────────
app.use(cors({
 origin: ['https://fmu-mn0b.onrender.com', 'http://localhost:3000'],
   credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api", limiter);

// ── Static Files (uploaded evidence) ──────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintLimiter, complaintRoutes);

// ── Health Check ───────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FMU Crime Branch API chal rahi hai ✅",
    timestamp: new Date().toISOString(),
  });
});

// ── 404 Handler ────────────────────────────────────────
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} nahi mili.`,
  });
});

// ── Error Handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 FMU Crime Branch Server chal raha hai`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 URL: http://localhost:${PORT}`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads\n`);
});
