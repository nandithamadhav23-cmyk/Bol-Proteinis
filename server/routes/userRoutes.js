const express = require('express');
const router = express.Router();
const User = require('../model/User');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /api/users — admin only, list all registered customers
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;