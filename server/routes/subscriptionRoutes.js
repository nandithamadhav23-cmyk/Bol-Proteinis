const express = require('express');
const router = express.Router();
const Subscription = require('../model/Subscription');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// POST /api/subscriptions — customer subscribes to a plan
router.post('/', verifyToken, async (req, res) => {
  try {
    const { planType, duration, price } = req.body;
    const sub = new Subscription({ customer: req.user.id, planType, duration, price });
    await sub.save();
    res.status(201).json(sub);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/subscriptions/my — customer's own subscriptions
router.get('/my', verifyToken, async (req, res) => {
  try {
    const subs = await Subscription.find({ customer: req.user.id }).sort({ createdAt: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/subscriptions/:id/cancel — customer cancels their own subscription
router.put('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const sub = await Subscription.findOneAndUpdate(
      { _id: req.params.id, customer: req.user.id },
      { status: 'cancelled' },
      { returnDocument: 'after' }
    );
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    res.json(sub);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/subscriptions — admin only, list all subscribers
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const subs = await Subscription.find()
      .populate('customer', 'name email phone community flatNumber')
      .sort({ createdAt: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;