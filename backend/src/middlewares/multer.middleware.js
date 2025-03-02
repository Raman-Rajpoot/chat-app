import multer from "multer";
import path from "path";

// Configure storage settings for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set destination folder for uploaded files (ensure this folder exists)
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Create a unique filename using the current timestamp and the original filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Use path.extname to get the file extension
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Not an image! Please upload only images."), false); // Reject file
  }
};

// Set up multer middleware with storage, file size limit, and file filter
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
//   fileFilter: fileFilter,
});

export default upload;
