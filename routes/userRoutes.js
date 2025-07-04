const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/add-points', userController.addPoints);
router.get('/leaderboard', userController.getLeaderboard);
router.post('/claim-daily-reward', userController.claimDailyReward);
// POST /withdraw-points: Withdraw points (requires userId and points)
router.post('/withdraw-points', userController.withdrawPoints);
router.post('/request-withdrawal', userController.requestWithdrawal); // User requests withdrawal
router.post('/approve-withdrawal', userController.approveWithdrawal); // Admin approves withdrawal
router.get('/withdrawal-history', userController.getWithdrawalHistory); // Get withdrawal history for a user
router.get('/all-withdrawals', userController.getAllWithdrawals); // Admin: get all withdrawal requests
router.get('/profile', userController.getProfile); // Get user profile (all details)

module.exports = router; 