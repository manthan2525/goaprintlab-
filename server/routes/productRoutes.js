const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadProductImages } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, adminOnly, uploadProductImages.array('images', 5), createProduct);
router.put('/:id', protect, adminOnly, uploadProductImages.array('images', 5), updateProduct);
router.put('/', protect, adminOnly, uploadProductImages.array('images', 5), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.delete('/', protect, adminOnly, deleteProduct);

module.exports = router;
