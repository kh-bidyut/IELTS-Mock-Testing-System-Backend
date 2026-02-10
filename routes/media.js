const express = require('express');
const { uploadSingle, handleUploadError } = require('../utils/fileUpload');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const { protect, admin } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/response');

const router = express.Router();

// @desc    Upload media file
// @route   POST /api/media/upload
// @access  Private/Admin
router.post('/upload', protect, admin, uploadSingle('media'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    // If using Cloudinary, the file is already uploaded
    // If using local storage, we need to upload to Cloudinary
    let fileUrl, publicId;
    
    if (req.file.path) {
      // Local file upload - upload to Cloudinary
      const fs = require('fs');
      const fileBuffer = fs.readFileSync(req.file.path);
      
      const result = await uploadToCloudinary(fileBuffer, {
        folder: 'ielts-tests',
        resource_type: req.file.mimetype.startsWith('audio') ? 'video' : 'image'
      });
      
      fileUrl = result.secure_url;
      publicId = result.public_id;
      
      // Clean up local file
      fs.unlinkSync(req.file.path);
    } else {
      // Already uploaded to Cloudinary via middleware
      fileUrl = req.file.secure_url;
      publicId = req.file.public_id;
    }

    successResponse(res, {
      file: {
        url: fileUrl,
        publicId: publicId,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      }
    }, 'File uploaded successfully');

  } catch (error) {
    console.error('Media upload error:', error);
    errorResponse(res, 'Failed to upload file', 500, error);
  }
});

// @desc    Upload profile picture
// @route   POST /api/media/profile-picture
// @access  Private
router.post('/profile-picture', protect, uploadSingle('profilePic'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    let fileUrl, publicId;
    
    if (req.file.path) {
      // Local file upload - upload to Cloudinary
      const fs = require('fs');
      const fileBuffer = fs.readFileSync(req.file.path);
      
      const result = await uploadToCloudinary(fileBuffer, {
        folder: 'ielts-profiles',
        resource_type: 'image',
        transformation: [
          { width: 300, height: 300, crop: 'thumb', gravity: 'face' }
        ]
      });
      
      fileUrl = result.secure_url;
      publicId = result.public_id;
      
      // Clean up local file
      fs.unlinkSync(req.file.path);
    } else {
      // Already uploaded to Cloudinary
      fileUrl = req.file.secure_url;
      publicId = req.file.public_id;
    }

    // Update user profile
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    if (user.profilePicPublicId) {
      // Delete old profile picture
      try {
        await deleteFromCloudinary(user.profilePicPublicId);
      } catch (err) {
        console.warn('Failed to delete old profile picture:', err);
      }
    }
    
    user.profilePic = fileUrl;
    user.profilePicPublicId = publicId;
    await user.save();

    successResponse(res, {
      profilePic: fileUrl,
      profilePicPublicId: publicId
    }, 'Profile picture updated successfully');

  } catch (error) {
    console.error('Profile picture upload error:', error);
    errorResponse(res, 'Failed to upload profile picture', 500, error);
  }
});

// @desc    Delete media file
// @route   DELETE /api/media/:publicId
// @access  Private/Admin
router.delete('/:publicId', protect, admin, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return errorResponse(res, 'Public ID is required', 400);
    }

    await deleteFromCloudinary(publicId);

    successResponse(res, {}, 'File deleted successfully');

  } catch (error) {
    console.error('Media delete error:', error);
    errorResponse(res, 'Failed to delete file', 500, error);
  }
});

module.exports = router;