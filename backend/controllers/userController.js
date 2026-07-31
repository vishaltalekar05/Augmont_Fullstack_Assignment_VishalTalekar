const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Create user (Sign up) - password is hashed before storing
exports.createUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ email, password: hashedPassword });

    return res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, email: user.email }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error creating user', error: err.message });
  }
};

// Update user (email and/or password)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    return res.json({ message: 'User updated successfully', user: { id: user.id, email: user.email } });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating user', error: err.message });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'email', 'createdAt'] });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

// Login - issues a JWT on valid credentials
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.json({ message: 'Login successful', token });
  } catch (err) {
    return res.status(500).json({ message: 'Error logging in', error: err.message });
  }
};
