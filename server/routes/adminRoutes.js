const express = require('express');
const { getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const {
  getAllCustomRequests,
  updateCustomRequestStatus,
} = require('../controllers/customRequestController');
const { getAllCustomers } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const Product = require('../models/Product');
const Order = require('../models/Order');
const CustomRequest = require('../models/CustomRequest');
const User = require('../models/User');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/orders', getAllOrders);
router.put('/orders/:id', updateOrderStatus);
router.put('/orders', updateOrderStatus);

router.get('/custom-requests', getAllCustomRequests);
router.put('/custom-requests/:id', updateCustomRequestStatus);
router.put('/custom-requests', updateCustomRequestStatus);

router.get('/customers', getAllCustomers);

router.get('/stats', async (_req, res) => {
  try {
    const [totalProducts, totalCustomers, totalOrders, totalCustomRequests, revenueAgg] =
      await Promise.all([
        Product.countDocuments(),
        User.countDocuments({ role: 'customer' }),
        Order.countDocuments(),
        CustomRequest.countDocuments(),
        Order.aggregate([
          { $match: { orderStatus: { $ne: 'Cancelled' } } },
          { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
        ]),
      ]);

    res.json({
      totalProducts,
      totalCustomers,
      totalOrders,
      totalCustomRequests,
      totalRevenue: revenueAgg[0]?.totalRevenue || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to compute stats.' });
  }
});

module.exports = router;
