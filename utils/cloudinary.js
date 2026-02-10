// Cloudinary configuration and utility functions

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ielts-tests',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'mp3', 'wav', 'mpeg'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' }
    ]
  }
});

// Multer upload configuration
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Upload single file
const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

// Upload multiple files
const uploadMultiple = (fieldName, maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

// Upload file to Cloudinary directly
const uploadToCloudinary = async (fileBuffer, options = {}) => {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }).end(fileBuffer);
    });
    return result;
  } catch (error) {
    throw new Error('Cloudinary upload failed: ' + error.message);
  }
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error('Cloudinary delete failed: ' + error.message);
  }
};

// Get file URL from public ID
const getFileUrl = (publicId) => {
  return cloudinary.url(publicId);
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadToCloudinary,
  deleteFromCloudinary,
  getFileUrl,
  cloudinary
};