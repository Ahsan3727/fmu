const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Uploads folder exist nahi toh banao
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Har complaint ka alag folder
    const complaintFolder = path.join(uploadDir, req.complaintId || "temp");
    if (!fs.existsSync(complaintFolder)) {
      fs.mkdirSync(complaintFolder, { recursive: true });
    }
    cb(null, complaintFolder);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File type filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Sirf Images (JPG, PNG) aur Documents (PDF, DOC) allowed hain!"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

module.exports = upload;
