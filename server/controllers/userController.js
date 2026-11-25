const User = require('../models/User');

async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to load profile.' });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    if (name !== undefined && String(name).trim()) {
      user.name = String(name).trim();
    }
    if (phone !== undefined) {
      user.phone = String(phone).trim();
    }
    if (address && typeof address === 'object') {
      user.address = {
        street: address.street ?? user.address?.street ?? '',
        city: address.city ?? user.address?.city ?? '',
        state: address.state ?? user.address?.state ?? 'Goa',
        pincode: address.pincode ?? user.address?.pincode ?? '',
      };
    }

    await user.save();
    return res.json({
      message: 'Profile updated successfully.',
      user: user.toSafeObject(),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to update profile.' });
  }
}

async function getAllCustomers(_req, res) {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-password')
      .sort({ createdAt: -1 });
    return res.json(customers);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch customers.' });
  }
}

module.exports = { getProfile, updateProfile, getAllCustomers };
