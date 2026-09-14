const express = require('express');
const router = express.Router();
const MenuItem = require('../model/MenuItem');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /api/menu - all active items, grouped naturally by day when sorted
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find({ active: true });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/menu/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/menu - create item (admin only)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const item = new MenuItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/menu/:id - update item (admin only)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/menu/:id (admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;