const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Login karein pehle.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id);

    if (!req.admin || !req.admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Admin account active nahi hai.",
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token. Dobara login karein.",
    });
  }
};

// Sirf superadmin ke liye
const superAdminOnly = (req, res, next) => {
  if (req.admin.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Yeh action sirf SuperAdmin kar sakta hai.",
    });
  }
  next();
};

module.exports = { protect, superAdminOnly };
