const Cart = require('../models/Cart');
const Order = require('../models/Order');

const VALID_ORDER_STATUSES = [
  'Pending',
  'Processing',
  'Printing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

async function createOrder(req, res) {
  try {
    const { shippingAddress } = req.body;
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        message: 'Complete shipping address (name, phone, street, city, pincode) is required.',
      });
    }

    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your shopping cart is empty.' });
    }

    const validItems = cart.items.filter((item) => item.productId);
    if (validItems.length === 0) {
      return res.status(400).json({ message: 'No valid products found in your cart.' });
    }

    const orderItems = validItems.map((item) => ({
      productId: item.productId._id,
      title: item.productId.title,
      image: item.productId.images?.[0] || '',
      material: item.material,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress: {
        fullName: String(shippingAddress.fullName).trim(),
        phone: String(shippingAddress.phone).trim(),
        street: String(shippingAddress.street).trim(),
        city: String(shippingAddress.city).trim(),
        state: String(shippingAddress.state || 'Goa').trim(),
        pincode: String(shippingAddress.pincode).trim(),
      },
      orderStatus: 'Pending',
    });

    cart.items = [];
    await cart.save();

    return res.status(201).json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to place order.' });
  }
}

async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to load orders.' });
  }
}

async function getAllOrders(_req, res) {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to load all orders.' });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const targetId = req.params.id || req.body.orderId;
    const { orderStatus } = req.body;

    if (!VALID_ORDER_STATUSES.includes(orderStatus)) {
      return res.status(400).json({
        message: `Invalid orderStatus. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      targetId,
      { orderStatus },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to update order status.' });
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
