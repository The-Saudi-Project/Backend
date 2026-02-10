import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/payments";

// ensure folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

export const uploadPayment = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // ✅ 3 MB
  },
});
