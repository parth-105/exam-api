const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    // console.log('Registered user id:', user._id);
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: user._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    // console.log('Login user id:', user._id);
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token:token , userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add points for a user
exports.addPoints = async (req, res) => {
  try {
    const { userId, points, game } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const now = new Date();
    user.pointsHistory.push({ date: now, points, game });
    user.totalPoints += points;
    await user.save();
    res.json({ message: 'Points added successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get leaderboard (last 7 days)
exports.getLeaderboard = async (req, res) => {
  try {
    const now = new Date();
    const lastSunday = new Date(now);
    lastSunday.setDate(now.getDate() - now.getDay()); // Sunday of this week
    lastSunday.setHours(0, 0, 0, 0);
    const users = await User.find();
    const leaderboard = users.map(user => {
      const last7DaysPoints = user.pointsHistory
        .filter(entry => entry.date >= lastSunday)
        .reduce((sum, entry) => sum + entry.points, 0);
      return {
        username: user.username,
        email: user.email,
        last7DaysPoints,
        totalPoints: user.totalPoints
      };
    });
    leaderboard.sort((a, b) => b.last7DaysPoints - a.last7DaysPoints);
    leaderboard.forEach((user, idx) => user.rank = idx + 1);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 