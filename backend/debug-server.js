const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');

const app = express();

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'bankify_super_secret_key';

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  console.log('=== REGISTER HIT ===');
  console.log('Body:', JSON.stringify(req.body));
  
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

    user = new User({ username, password: hashedPassword });
    await user.save();
    console.log('User saved:', user._id.toString());

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    console.log('Token created, sending response...');
    
    res.status(201);
    return res.json({ token, username: user.username });
  } catch (err) {
    console.error('CAUGHT ERROR:', err);
    res.status(500);
    return res.json({ error: 'Server Error: ' + err.message });
  }
});

// Express 5 error handler
app.use((err, req, res, next) => {
  console.error('=== EXPRESS ERROR HANDLER ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500);
  res.json({ error: 'Express Error: ' + err.message });
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bankify';

// Start server FIRST, then connect DB
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  
  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log('MongoDB Error:', err));
});
