const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { calculateUnitPrice } = require('../utils/pricing');

async function getPopulatedCart(userId) {
  let cart = await Cart.findOne({ userId }).populate('items.productId');
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
}

async function getCart(req, res) {
  try {
    const cart = await getPopulatedCart(req.user._id);
    return res.json(cart);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to load cart.' });
  }
}

async function addToCart(req, res) {
  try {
    const { productId, material, color, size, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'productId is required.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    if (!product.inStock) {
      return res.status(400).json({ message: 'This product is currently out of stock.' });
    }

    const selectedMaterial = material || product.materials[0] || 'PLA';
    const selectedColor = color || product.colors[0] || 'Matte Black';
    const selectedSize = size || product.sizes[0] || 'Medium';
    const qty = Math.max(1, Number(quantity) || 1);
    const unitPrice = calculateUnitPrice(product.basePrice, selectedMaterial, selectedSize);

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) =>
        String(item.productId) === String(product._id) &&
        item.material === selectedMaterial &&
        item.color === selectedColor &&
        item.size === selectedSize
    );

    if (existingItem) {
      existingItem.quantity += qty;
      existingItem.unitPrice = unitPrice;
    } else {
      cart.items.push({
        productId: product._id,
        material: selectedMaterial,
        color: selectedColor,
        size: selectedSize,
        quantity: qty,
        unitPrice,
      });
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.productId');
    return res.status(200).json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to add item to cart.' });
  }
}

async function updateCartItem(req, res) {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const qty = Number(quantity);

    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1.' });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    item.quantity = qty;
    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.productId');
    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to update cart item.' });
  }
}

async function removeCartItem(req, res) {
  try {
    const itemId = req.params.itemId || req.body.itemId;
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    if (!itemId) {
      cart.items = [];
    } else {
      cart.items = cart.items.filter((item) => String(item._id) !== String(itemId));
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.productId');
    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to remove cart item.' });
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};
