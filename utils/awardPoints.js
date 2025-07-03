const User = require('../models/User');

/**
 * Awards points to a user and, if they have a referrer, awards 5% commission to the referrer (as a decimal, rounded to 2 decimals).
 * @param {String} userId - The ID of the user earning points.
 * @param {Number} points - The number of points to award.
 * @param {String} reason - The reason for the points (for pointsHistory).
 */
async function awardPoints(userId, points, reason) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Award points to the user
  user.totalPoints += points;
  user.pointsHistory.push({ date: new Date(), points, game: reason });
  await user.save();

  // If user was referred, award 5% to referrer (as decimal, 2 digits)
  if (user.referredBy) {
    const referrer = await User.findOne({ referralCode: user.referredBy });
    if (referrer) {
      let commission = +(points * 0.05).toFixed(2); // round to 2 decimals
      if (commission > 0) {
        referrer.totalPoints = +(referrer.totalPoints + commission).toFixed(2);
        referrer.pointsHistory.push({
          date: new Date(),
          points: commission,
          game: `Referral Commission: ${commission} points from ${user.username}'s ${reason}`
        });
        await referrer.save();
      }
    }
  }
}

module.exports = awardPoints; 