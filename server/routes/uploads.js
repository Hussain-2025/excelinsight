const express = require('express');
const router = express.Router();
const Upload = require('../models/Upload');
const { protect } = require('../middleware/auth');

// @route POST /api/uploads
// Save an upload record to DB
router.post('/', protect, async (req, res) => {
  try {
    const { fileName, fileSize, sheetsCount, sheetNames, totalRows, totalColumns, columns, sampleData, aiInsight } = req.body;

    const upload = await Upload.create({
      user: req.user._id,
      fileName,
      fileSize: fileSize || 0,
      sheetsCount: sheetsCount || (sheetNames ? sheetNames.length : 1),
      sheetNames: sheetNames || [],
      totalRows: totalRows || 0,
      totalColumns: totalColumns || 0,
      columns: columns || [],
      sampleData: sampleData || {},
      aiInsight: aiInsight || ''
    });

    res.status(201).json({
      success: true,
      data: upload
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/uploads
// Get current user upload history
router.get('/', protect, async (req, res) => {
  try {
    const uploads = await Upload.find({ user: req.user._id })
      .sort({ uploadedAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: uploads.length,
      data: uploads
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/uploads/:id
// Get a single upload record (with sampleData for restoring)
router.get('/:id', protect, async (req, res) => {
  try {
    const upload = await Upload.findOne({ _id: req.params.id, user: req.user._id });
    if (!upload) {
      return res.status(404).json({ success: false, message: 'Upload record not found' });
    }
    res.json({
      success: true,
      data: upload
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route DELETE /api/uploads/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const upload = await Upload.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!upload) {
      return res.status(404).json({ success: false, message: 'Upload record not found' });
    }
    res.json({
      success: true,
      message: 'Upload record removed from history'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
