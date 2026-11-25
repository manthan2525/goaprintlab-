const fs = require('fs');
const path = require('path');
const multer = require('multer');

function getUploadBaseDir() {
  const configured = process.env.UPLOAD_DIR || './uploads';
  return path.resolve(__dirname, '..', configured);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function sanitizeFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const base = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 48);
  return `${Date.now()}-${base || 'file'}${ext}`;
}

const modelStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const targetDir = path.join(getUploadBaseDir(), 'models');
    ensureDir(targetDir);
    cb(null, targetDir);
  },
  filename: (_req, file, cb) => {
    cb(null, sanitizeFilename(file.originalname));
  },
});

const productImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const targetDir = path.join(getUploadBaseDir(), 'products');
    ensureDir(targetDir);
    cb(null, targetDir);
  },
  filename: (_req, file, cb) => {
    cb(null, sanitizeFilename(file.originalname));
  },
});

const ALLOWED_MODEL_EXTS = new Set(['.stl', '.obj', '.3mf']);
const ALLOWED_IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg']);

const uploadModelFile = multer({
  storage: modelStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_MODEL_EXTS.has(ext)) {
      return cb(new Error('Only .stl, .obj, or .3mf 3D model files are permitted.'));
    }
    cb(null, true);
  },
});

const uploadProductImages = multer({
  storage: productImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_IMAGE_EXTS.has(ext)) {
      return cb(new Error('Only .png, .jpg, .jpeg, .webp, or .svg images are permitted.'));
    }
    cb(null, true);
  },
});

module.exports = {
  getUploadBaseDir,
  ensureDir,
  uploadModelFile,
  uploadProductImages,
};
