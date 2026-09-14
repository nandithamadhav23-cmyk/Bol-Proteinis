const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../model/User');

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    community: user.community,
    flatNumber: user.flatNumber,
  };
}

// POST /api/auth/register — customer sign up
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, community, flatNumber } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Name, email, password, and phone are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'An account with this email already exists' });

    const user = new User({ name, email, password, phone, community, flatNumber });
    await user.save();

    const token = signToken({ id: user._id, role: 'customer' });
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/auth/login — customer login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = signToken({ id: user._id, role: 'customer' });
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/auth/admin-login — checked against env credentials, not a DB record
router.post('/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = signToken({ id: 'admin', role: 'admin' });
    return res.json({ token });
  }
  res.status(401).json({ message: 'Invalid admin credentials' });
});

module.exports = router;