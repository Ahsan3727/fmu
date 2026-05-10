const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

// Token generate helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// ── @desc    Admin login
// ── @route   POST /api/auth/login
// ── @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email aur password dono zaroori hain.",
      });
    }

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Email ya password galat hai.",
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account active nahi hai.",
      });
    }

    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── @desc    Get current logged in admin
// ── @route   GET /api/auth/me
// ── @access  Private
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.admin,
  });
};

// ── @desc    Create first admin (sirf ek baar — setup ke liye)
// ── @route   POST /api/auth/setup
// ── @access  Public (but checks if admin exists)
const setupAdmin = async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({ role: "superadmin" });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "SuperAdmin already exist karta hai.",
      });
    }

    const { name, email, password } = req.body;

    const admin = await Admin.create({
      name,
      email,
      password,
      role: "superadmin",
    });

    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      message: "SuperAdmin create ho gaya!",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { login, getMe, setupAdmin };
