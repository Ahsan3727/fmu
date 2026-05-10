const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error("❌ Error:", err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error.message = "Resource nahi mila.";
    return res.status(404).json({ success: false, message: error.message });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field} already exist karta hai.`;
    return res.status(400).json({ success: false, message: error.message });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ success: false, message: messages.join(", ") });
  }

  // Multer error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File size 10MB se zyada nahi ho sakti.",
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || "Server error. Baad mein try karein.",
  });
};

module.exports = errorHandler;
