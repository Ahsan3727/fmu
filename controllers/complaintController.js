const Complaint = require("../models/Complaint");
const path = require("path");
const fs = require("fs");

// ── @desc    Submit new complaint
// ── @route   POST /api/complaints
// ── @access  Public
const submitComplaint = async (req, res) => {
  try {
    const { name, rollNumber, department, complaint, isAnonymous } = req.body;

    // Files process karo
    const files = req.files
      ? req.files.map((file) => ({
          originalName: file.originalname,
          filename: file.filename,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
        }))
      : [];

    const newComplaint = await Complaint.create({
      name,
      rollNumber,
      department,
      complaint,
      files,
      isAnonymous: isAnonymous === "true",
    });

    // Files ko tracking ID folder mein move karo
    if (files.length > 0) {
      const oldDir = path.join(__dirname, "../uploads/temp");
      const newDir = path.join(__dirname, `../uploads/${newComplaint.trackingId}`);

      if (fs.existsSync(oldDir)) {
        fs.renameSync(oldDir, newDir);
        // DB mein paths update karo
        newComplaint.files = newComplaint.files.map((f) => ({
          ...f,
          path: f.path.replace("/temp/", `/${newComplaint.trackingId}/`),
        }));
        await newComplaint.save();
      }
    }

    res.status(201).json({
      success: true,
      message: "Aap ki complaint successfully submit ho gayi!",
      trackingId: newComplaint.trackingId,
      data: {
        trackingId: newComplaint.trackingId,
        status: newComplaint.status,
        createdAt: newComplaint.createdAt,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ── @desc    Track complaint by tracking ID
// ── @route   GET /api/complaints/track/:trackingId
// ── @access  Public
const trackComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      trackingId: req.params.trackingId,
    }).select("-files.path -adminNotes"); // Sensitive info hide

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Koi complaint nahi mili is tracking ID se.",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        trackingId: complaint.trackingId,
        status: complaint.status,
        department: complaint.department,
        priority: complaint.priority,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── @desc    Get all complaints (Admin)
// ── @route   GET /api/complaints
// ── @access  Private (Admin)
const getAllComplaints = async (req, res) => {
  try {
    const { status, department, priority, page = 1, limit = 10, search } = req.query;

    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { trackingId: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── @desc    Get single complaint (Admin)
// ── @route   GET /api/complaints/:id
// ── @access  Private (Admin)
const getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint nahi mili." });
    }
    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── @desc    Update complaint status (Admin)
// ── @route   PUT /api/complaints/:id
// ── @access  Private (Admin)
const updateComplaint = async (req, res) => {
  try {
    const { status, priority, adminNotes } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, priority, adminNotes },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint nahi mili." });
    }

    res.status(200).json({
      success: true,
      message: "Complaint update ho gayi.",
      data: complaint,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── @desc    Delete complaint (Admin)
// ── @route   DELETE /api/complaints/:id
// ── @access  Private (Admin)
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint nahi mili." });
    }

    // Files bhi delete karo
    const folder = path.join(__dirname, `../uploads/${complaint.trackingId}`);
    if (fs.existsSync(folder)) {
      fs.rmSync(folder, { recursive: true });
    }

    await complaint.deleteOne();
    res.status(200).json({ success: true, message: "Complaint delete ho gayi." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── @desc    Get dashboard stats (Admin)
// ── @route   GET /api/complaints/stats
// ── @access  Private (Admin)
const getStats = async (req, res) => {
  try {
    const [total, pending, underReview, resolved, rejected, byDept] =
      await Promise.all([
        Complaint.countDocuments(),
        Complaint.countDocuments({ status: "Pending" }),
        Complaint.countDocuments({ status: "Under Review" }),
        Complaint.countDocuments({ status: "Resolved" }),
        Complaint.countDocuments({ status: "Rejected" }),
        Complaint.aggregate([
          { $group: { _id: "$department", count: { $sum: 1 } } },
        ]),
      ]);

    res.status(200).json({
      success: true,
      data: { total, pending, underReview, resolved, rejected, byDepartment: byDept },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitComplaint,
  trackComplaint,
  getAllComplaints,
  getComplaint,
  updateComplaint,
  deleteComplaint,
  getStats,
};
