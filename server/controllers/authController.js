const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');

async function register(req, res) {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password,
      phone: phone ? String(phone).trim() : '',
      address: address && typeof address === 'object' ? address : { state: 'Goa' },
      role: 'customer',
    });

    const token = generateToken(user);
    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Registration failed.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    return res.json({
      message: 'Login successful.',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Login failed.' });
  }
}

module.exports = { register, login };
