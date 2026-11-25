const CustomRequest = require('../models/CustomRequest');

const VALID_CUSTOM_STATUSES = [
  'Pending Review',
  'Approved',
  'Printing',
  'Completed',
  'Rejected',
];

async function createCustomRequest(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Please upload a valid 3D model file (.stl, .obj, or .3mf).',
      });
    }

    const { material, color, size, quantity = 1, notes = '' } = req.body;
    if (!material || !color || !size) {
      return res.status(400).json({
        message: 'Material, colour, and target size/scale are required.',
      });
    }

    const customRequest = await CustomRequest.create({
      userId: req.user._id,
      modelFileName: req.file.originalname,
      modelFileUrl: `/uploads/models/${req.file.filename}`,
      material: String(material).trim(),
      color: String(color).trim(),
      size: String(size).trim(),
      quantity: Math.max(1, Number(quantity) || 1),
      notes: String(notes).trim(),
      status: 'Pending Review',
    });

    return res.status(201).json(customRequest);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || 'Failed to submit custom 3D printing request.' });
  }
}

async function getMyCustomRequests(req, res) {
  try {
    const requests = await CustomRequest.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json(requests);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || 'Failed to load custom print requests.' });
  }
}

async function getAllCustomRequests(_req, res) {
  try {
    const requests = await CustomRequest.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    return res.json(requests);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || 'Failed to load all custom requests.' });
  }
}

async function updateCustomRequestStatus(req, res) {
  try {
    const targetId = req.params.id || req.body.requestId;
    const { status } = req.body;

    if (!VALID_CUSTOM_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_CUSTOM_STATUSES.join(', ')}`,
      });
    }

    const updated = await CustomRequest.findByIdAndUpdate(
      targetId,
      { status },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!updated) {
      return res.status(404).json({ message: 'Custom print request not found.' });
    }

    return res.json(updated);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || 'Failed to update custom request status.' });
  }
}

module.exports = {
  createCustomRequest,
  getMyCustomRequests,
  getAllCustomRequests,
  updateCustomRequestStatus,
};
