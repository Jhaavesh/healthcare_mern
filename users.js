// backend/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middlewares/auth');

// GET /api/users?role=doctor  (or /api/users to list all)
router.get('/', async (req, res) => {
  try {
    const role = req.query.role;
    const q = {};
    if (role) q.role = role;
    // Only select safe fields
    const users = await User.find(q).select('name email role specialization phone bio');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET single user by id (optional / for UI)
router.get('/:id', async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select('-password');
    if (!u) return res.status(404).json({ msg: 'User not found' });
    res.json(u);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
