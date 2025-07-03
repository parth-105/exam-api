const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/add-points', userController.addPoints);
router.get('/leaderboard', userController.getLeaderboard);
router.post('/claim-daily-reward', userController.claimDailyReward);

module.exports = router; 