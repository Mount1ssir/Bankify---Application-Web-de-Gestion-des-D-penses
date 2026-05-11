const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  incomeCategories: {
    type: [String],
    default: ['Salary', 'Investments', 'Job', 'Work', 'Gift from family']
  },
  expenseCategories: {
    type: [String],
    default: ['Groceries', 'Rent', 'Utilities', 'Entertainment', 'Shopping']
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
