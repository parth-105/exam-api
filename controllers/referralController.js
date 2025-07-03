const User = require('../models/User');
const awardPoints = require('../utils/awardPoints');

// POST /api/referral
// Body: { userId, referralCode }
exports.useReferralCode = async (req, res) => {
  try {
    const { userId, referralCode } = req.body;
    if (!userId || !referralCode) {
      return res.status(400).json({ message: 'userId and referralCode are required.' });
    }

    // Find the user using the code
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Prevent using a code more than once
    if (user.referredBy) {
      return res.status(400).json({ message: 'Referral code already used.' });
    }

    // Prevent self-referral
    if (user.referralCode === referralCode) {
      return res.status(400).json({ message: 'Cannot use your own referral code.' });
    }

    // Find the referrer
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return res.status(404).json({ message: 'Referral code not found.' });
    }

    // Set referredBy for the user
    user.referredBy = referralCode;
    await user.save();

    // Award points to User B (referred user)
    await awardPoints(user._id, 100, 'Referral Bonus');
    // Award points to User A (referrer)
    await awardPoints(referrer._id, 100, 'Referral Bonus (referrer)');

    res.status(200).json({ message: `${user.username} received 100 points, ${referrer.username} received 100 points and commission.` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 