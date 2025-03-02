import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Fix `__dirname` in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure `uploads` directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Allowed file types
const allowedTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "text/plain", // .txt
  "application/zip", // .zip
  "application/x-rar-compressed", // .rar
  "application/x-7z-compressed", // .7z
  "video/mp4", // .mp4
  "video/x-msvideo", // .avi
  "video/quicktime", // .mov
  "audio/mpeg", // .mp3
  "audio/wav", // .wav
];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type."), false);
  }
};

// Configure multer instance
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 10MB
  fileFilter,
});

// Export different upload types
export const uploadSingle = upload.single("file"); // Single file upload
export const uploadMultiple = upload.array("attachments", 5); // Multiple files upload (max 5)
export const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "document", maxCount: 2 },
]); // Multiple fields

export default upload;
