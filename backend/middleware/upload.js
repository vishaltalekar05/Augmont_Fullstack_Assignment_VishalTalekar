const multer = require('multer');
const path = require('path');

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const bulkStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    cb(null, `bulk-${Date.now()}-${file.originalname}`);
  }
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  }
});

const bulkUpload = multer({
  storage: bulkStorage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max for large product files
});

module.exports = { imageUpload, bulkUpload };
