const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Upload = require('../models/Upload');
const { protect, adminOnly } = require('../middleware/auth');

// @route GET /api/admin/stats
// Admin overview KPI metrics
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalUploads = await Upload.countDocuments();
    
    const uploads = await Upload.find().select('totalRows fileSize');
    let totalRowsProcessed = 0;
    let totalBytesProcessed = 0;
    uploads.forEach(u => {
      totalRowsProcessed += (u.totalRows || 0);
      totalBytesProcessed += (u.fileSize || 0);
    });

    const recentUploads = await Upload.find()
      .populate('user', 'name email role')
      .sort({ uploadedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalUploads,
        totalRowsProcessed,
        totalBytesProcessed,
        recentUploads
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/admin/users
// Admin list all users with their upload count
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    const usersWithCounts = await Promise.all(
      users.map(async (u) => {
        const count = await Upload.countDocuments({ user: u._id });
        return {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          uploadsCount: count
        };
      })
    );

    res.json({
      success: true,
      users: usersWithCounts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route PATCH /api/admin/users/:id/role
// Admin toggle or change user role
router.patch('/users/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
