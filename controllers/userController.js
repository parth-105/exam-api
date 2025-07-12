const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const awardPoints = require('../utils/awardPoints');
const Withdrawal = require('../models/Withdrawal');
const crypto = require('crypto');

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
      userId: user._id,
      user : user
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
    res.json({ token:token , userId: user._id , user: user});
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
    await awardPoints(userId, points, game || 'Manual Add');
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

// 7-day daily reward system
const dailyRewards = [5, 10, 15, 20, 25, 30, 50];

exports.claimDailyReward = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastClaim = user.lastDailyRewardDate ? new Date(user.lastDailyRewardDate) : null;
    if (lastClaim) lastClaim.setHours(0, 0, 0, 0);

    if (lastClaim && lastClaim.getTime() === today.getTime()) {
      return res.status(400).json({ message: 'Already claimed today\'s daily reward.' });
    }

    // Get reward for current day
    const rewardDay = user.dailyRewardDay || 1;
    if (rewardDay > 7) {
      return res.status(400).json({ message: 'You have already claimed all 7 daily rewards.' });
    }
    const reward = dailyRewards[rewardDay - 1];
    await awardPoints(user._id, reward, `Daily Reward (Day ${rewardDay})`);

    // Update for next day
    user.lastDailyRewardDate = today;
    user.dailyRewardDay = rewardDay + 1;
    await user.save();

    res.json({ message: `Claimed Day ${rewardDay} daily reward: ${reward} points.`, reward, day: rewardDay });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User requests withdrawal (creates pending request)
exports.requestWithdrawal = async (req, res) => {
  try {
    const { userId, points, username, email } = req.body;
    if (!userId || !points || !username || !email) {
      return res.status(400).json({ message: 'userId, points, username, and email are required' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.totalPoints < points) {
      return res.status(400).json({ message: 'Insufficient points' });
    }
    const withdrawal = new Withdrawal({ 
      user: userId, 
      username: username,
      email: email,
      amount: points 
    });
    await withdrawal.save();
    res.json({ message: 'Withdrawal request submitted and pending admin approval.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin approves withdrawal
exports.approveWithdrawal = async (req, res) => {
  try {
    const { withdrawalId, code } = req.body;
    if (!withdrawalId || !code) {
      return res.status(400).json({ message: 'withdrawalId and code are required' });
    }
    const withdrawal = await Withdrawal.findById(withdrawalId).populate('user');
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal request not found' });
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal already processed' });
    }
    const user = withdrawal.user;
    if (user.totalPoints < withdrawal.amount) {
      return res.status(400).json({ message: 'User has insufficient points at approval time' });
    }
    // Deduct points from user and update history (same logic as before)
    let remaining = withdrawal.amount;
    for (let i = user.pointsHistory.length - 1; i >= 0 && remaining > 0; i--) {
      const entry = user.pointsHistory[i];
      if (entry.points <= remaining) {
        remaining -= entry.points;
        user.pointsHistory.splice(i, 1);
      } else {
        entry.points -= remaining;
        remaining = 0;
      }
    }
    user.totalPoints -= withdrawal.amount;
    await user.save();
    withdrawal.status = 'approved';
    withdrawal.code = code;
    withdrawal.approvedAt = new Date();
    await withdrawal.save();
    // Optionally: send code to user (e.g., email, notification)
    res.json({ message: 'Withdrawal approved, points deducted, and code sent to user.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Withdraw points for a user
exports.withdrawPoints = async (req, res) => {
  try {
    const { userId, points } = req.body;
    if (!userId || !points) {
      return res.status(400).json({ message: 'userId and points are required' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.totalPoints < points) {
      return res.status(400).json({ message: 'Insufficient points' });
    }
    let remaining = points;
    // Start from the most recent history entry
    for (let i = user.pointsHistory.length - 1; i >= 0 && remaining > 0; i--) {
      const entry = user.pointsHistory[i];
      if (entry.points <= remaining) {
        remaining -= entry.points;
        user.pointsHistory.splice(i, 1); // Remove entry
      } else {
        entry.points -= remaining;
        remaining = 0;
      }
    }
    user.totalPoints -= points;
    await user.save();
    res.json({ message: 'Points withdrawn and history updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get withdrawal history for a user
exports.getWithdrawalHistory = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    const withdrawals = await Withdrawal.find({ user: userId }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all withdrawal requests (admin view)
exports.getAllWithdrawals = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const withdrawals = await Withdrawal.find(filter).sort({ createdAt: -1 });
    
    // Format response to include username and email (now stored directly)
    const formattedWithdrawals = withdrawals.map(w => ({
      _id: w._id,
      user: {
        _id: w.user,
        username: w.username,
        email: w.email
      },
      amount: w.amount,
      status: w.status,
      code: w.code,
      requestedAt: w.requestedAt,
      approvedAt: w.approvedAt,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt
    }));
    
    res.json(formattedWithdrawals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user profile (all details)
exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get full user transaction history (earnings, withdrawals, pending/approved)
exports.getUserHistory = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    // Earnings (from pointsHistory)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const earnings = user.pointsHistory.map(e => ({
      points: e.points,
      date: e.date.toISOString(),
      game: e.game
    }));

    // Withdrawals
    const withdrawals = await Withdrawal.find({ user: userId }).sort({ createdAt: -1 });
    const formattedWithdrawals = withdrawals.map(w => ({
      id: w._id,
      amount: w.amount,
      status: w.status,
      requestedAt: w.requestedAt ? w.requestedAt.toISOString() : null,
      approvedAt: w.approvedAt ? w.approvedAt.toISOString() : null,
      code: w.code || null
    }));

    const pendingWithdrawals = formattedWithdrawals.filter(w => w.status === 'pending');
    const approvedWithdrawals = formattedWithdrawals.filter(w => w.status === 'approved');

    res.json({
      earnings,
      withdrawals: formattedWithdrawals,
      pendingWithdrawals,
      approvedWithdrawals
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};