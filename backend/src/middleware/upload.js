import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import os from 'os';

const storage = multer.diskStorage({
  destination: os.tmpdir(),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm',
    'application/pdf', 'text/plain',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

export const compressImage = async (filePath, mimetype) => {
  if (!mimetype.startsWith('image/')) return filePath;

  const ext = path.extname(filePath);
  const outputPath = filePath.replace(ext, `_compressed${ext}`);

  await sharp(filePath)
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(outputPath);

  fs.unlinkSync(filePath);
  return outputPath;
};

export default upload;
