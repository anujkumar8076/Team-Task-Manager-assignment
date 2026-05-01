const User = require('../models/User');

// @desc    Get all users (for admin to assign members)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('name');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers };
