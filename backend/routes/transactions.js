const express = require('express');
const jwt = require('jsonwebtoken');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'bankify_super_secret_key';

// Middleware to protect routes
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    res.status(401);
    return res.json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401);
    res.json({ error: 'Token is not valid' });
  }
};

// GET all transactions for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500);
    res.json({ error: 'Server Error' });
  }
});

// POST new transaction
router.post('/', auth, async (req, res) => {
  try {
    const { type, amount, category, date } = req.body;
    const newTx = new Transaction({
      userId: req.userId,
      type,
      amount,
      category,
      date
    });
    const savedTx = await newTx.save();
    res.status(201);
    res.json(savedTx);
  } catch (err) {
    console.error('Add transaction error:', err);
    res.status(500);
    res.json({ error: 'Server Error' });
  }
});

// GET user categories
router.get('/categories', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({
      Income: user.incomeCategories,
      Expense: user.expenseCategories
    });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500);
    res.json({ error: 'Server Error' });
  }
});

// POST update categories
router.post('/categories', auth, async (req, res) => {
  try {
    const { type, action, category } = req.body; // action: 'add' or 'remove'
    const user = await User.findById(req.userId);
    const key = type === 'Income' ? 'incomeCategories' : 'expenseCategories';
    
    if (action === 'add' && !user[key].includes(category)) {
      user[key].push(category);
    } else if (action === 'remove') {
      user[key] = user[key].filter(c => c !== category);
    }
    
    await user.save();
    res.json({ success: true, categories: user[key] });
  } catch (err) {
    console.error('Update categories error:', err);
    res.status(500);
    res.json({ error: 'Server Error' });
  }
});

module.exports = router;
