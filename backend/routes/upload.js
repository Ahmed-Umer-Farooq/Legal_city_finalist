const express = require('express');
const { createSecureUpload } = require('../utils/fileUpload');
const { uploadLimiter } = require('../utils/security');
const { authenticateToken } = require('../utils/middleware');
const router = express.Router();

// Create secure upload instance
const upload = createSecureUpload('uploads', 5 * 1024 * 1024); // 5MB limit

// Upload image endpoint with security
router.post('/image', uploadLimiter, authenticateToken, (req, res) => {
  console.log('📤 Upload request received');
  
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('❌ Upload error:', err.message);
      return res.status(400).json({ error: err.message });
    }
    
    try {
      if (!req.file) {
        console.log('❌ No file in request');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      console.log('✅ File uploaded successfully:', fileUrl);
      
      res.json({
        message: 'File uploaded successfully',
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error('❌ Upload processing error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });
});

module.exports = router;