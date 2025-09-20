import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Storage configuration for profile documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = '';
    
    // Determine upload path based on field name
    switch (file.fieldname) {
      case 'resume':
        uploadPath = 'uploads/profiles/resumes';
        break;
      case 'marksheet':
        uploadPath = 'uploads/profiles/marksheets';
        break;
      case 'communityCertificate':
        uploadPath = 'uploads/profiles/community-certificates';
        break;
      case 'extraCertificates':
        uploadPath = 'uploads/profiles/extra-certificates';
        break;
      default:
        uploadPath = 'uploads/profiles/misc';
    }
    
    createUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and user ID
    const userId = req.user?._id || 'anonymous';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const fieldName = file.fieldname;
    
    const filename = `${userId}_${fieldName}_${timestamp}${ext}`;
    
    cb(null, filename);
  }
});

// File filter - only allow PDFs
const fileFilter = (req, file, cb) => {
  console.log('[PROFILE-UPLOAD] File received:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype
  });
  
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error(`Only PDF files are allowed for ${file.fieldname}. Received: ${file.mimetype}`), false);
  }
};

// Configure multer
const profileUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 10 // Maximum 10 files total
  }
});

// Middleware for handling profile uploads
export const uploadProfileDocuments = profileUpload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'marksheet', maxCount: 1 },
  { name: 'communityCertificate', maxCount: 1 },
  { name: 'extraCertificates', maxCount: 5 } // Allow up to 5 extra certificates
]);

// Error handling middleware for multer
export const handleUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('[PROFILE-UPLOAD] Multer error:', error);
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB per file.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 10 files allowed.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field. Please check your form fields.'
        });
      default:
        return res.status(400).json({
          success: false,
          message: `Upload error: ${error.message}`
        });
    }
  } else if (error) {
    console.error('[PROFILE-UPLOAD] General error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'File upload failed'
    });
  }
  
  next();
};

// Utility function to delete old files when updating
export const deleteOldFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log('[PROFILE-UPLOAD] Deleted old file:', filePath);
    } catch (error) {
      console.error('[PROFILE-UPLOAD] Error deleting file:', filePath, error.message);
    }
  }
};

export default { uploadProfileDocuments, handleUploadErrors, deleteOldFile };
