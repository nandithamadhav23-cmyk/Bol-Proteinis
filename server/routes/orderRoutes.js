const express = require('express');
const router = express.Router();
const Order = require('../model/Order');
const { sendAdminNotification, sendCustomerConfirmation } = require('../utils/sendEmail');
const { sendOrderWhatsApp } = require('../utils/sendWhatsApp');
const { verifyToken, optionalAuth, requireAdmin } = require('../middleware/auth');

// POST /api/orders - create a new order. Works for guests; if a valid
// customer token is present, the order is linked to their account too.
router.post('/', optionalAuth, async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      status: 'pending',
      customer: req.user && req.user.role === 'customer' ? req.user.id : undefined,
    });
    await order.save();

    sendAdminNotification(order).catch((err) => console.error('Email error:', err.message));
    sendOrderWhatsApp(order).catch((err) => console.error('WhatsApp error:', err.message));

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/orders/my - the logged-in customer's own order history
router.get('/my', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders - ALL orders (admin only)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id - fetch a single order (used by the tracking page — kept
// public since guests need to track without an account, using just the order id)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/confirm - admin confirms with a cook time; triggers the
// customer's confirmation email.
router.put('/:id/confirm', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { cookTimeMinutes } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed', cookTimeMinutes, confirmedAt: new Date() },
      { returnDocument: 'after' }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    sendCustomerConfirmation(order).catch((err) => console.error('Email error:', err.message));

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/orders/:id/status - admin updates status further (preparing, delivered, cancelled)
router.put('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { returnDocument: 'after' }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;