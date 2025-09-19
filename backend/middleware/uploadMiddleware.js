import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads/resumes directory exists
const resumesDir = path.join(process.cwd(), 'uploads', 'resumes');
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resumesDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${unique}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Only PDF or DOC/DOCX files are allowed'));
  }
  cb(null, true);
}

export const uploadResume = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
