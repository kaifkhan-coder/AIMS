import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = "uploads";

// create uploads folder if not exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBaseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    const finalName = `${Date.now()}-${safeBaseName}${ext}`;
    cb(null, finalName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  const isMimeAllowed = allowedMimeTypes.includes(file.mimetype);
  const isExtAllowed = allowedExtensions.includes(ext);

  if (isMimeAllowed && isExtAllowed) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and PDF files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

export default upload;