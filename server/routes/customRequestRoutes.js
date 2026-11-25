const express = require('express');
const {
  createCustomRequest,
  getMyCustomRequests,
} = require('../controllers/customRequestController');
const { protect } = require('../middleware/authMiddleware');
const { uploadModelFile } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);
router.post('/', uploadModelFile.single('modelFile'), createCustomRequest);
router.get('/', getMyCustomRequests);

module.exports = router;
