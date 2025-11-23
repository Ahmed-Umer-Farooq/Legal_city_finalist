const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Secure file upload configuration
const createSecureUpload = (uploadPath = 'uploads', maxSize = 10 * 1024 * 1024) => {
  // Ensure upload directory exists
  const fullUploadPath = path.resolve(uploadPath);
  if (!fs.existsSync(fullUploadPath)) {
    fs.mkdirSync(fullUploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Prevent path traversal
      const safePath = path.resolve(fullUploadPath);
      cb(null, safePath);
    },
    filename: (req, file, cb) => {
      // Generate secure filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const ext = path.extname(file.originalname).toLowerCase();
      const safeName = `${timestamp}_${randomString}${ext}`;
      cb(null, safeName);
    }
  });

  const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/csv'
    ];

    // Allowed extensions
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.txt', '.csv'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSize,
      files: 5 // Maximum 5 files per request
    }
  });
};

module.exports = { createSecureUpload };