const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'bankify_super_secret_key';

// Register User
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400);
      return res.json({ error: 'Username and password are required' });
    }

    let user = await User.findOne({ username });
    if (user) {
      res.status(400);
      return res.json({ error: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201);
    res.json({ token, username: user.username });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500);
    res.json({ error: 'Server Error' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400);
      return res.json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      res.status(400);
      return res.json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400);
      return res.json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500);
    res.json({ error: 'Server Error' });
  }
});

module.exports = router;
