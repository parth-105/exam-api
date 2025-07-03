const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');

// POST /api/referral
router.post('/', referralController.useReferralCode);

module.exports = router; 