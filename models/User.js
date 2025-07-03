const mongoose = require('mongoose');

const pointsHistorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  points: { type: Number, required: true },
  game: { type: String, required: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  totalPoints: { type: Number, default: 0 },
  pointsHistory: { type: [pointsHistorySchema], default: [] },
  referralCode: { type: String, unique: true },
  referredBy: { type: String },
  dailyRewardDay: { type: Number, default: 1 }, // 1-7
  lastDailyRewardDate: { type: Date }
}, { timestamps: true });

// Helper to generate a random 6-letter code
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

userSchema.pre('save', async function (next) {
  if (!this.referralCode) {
    let code;
    let exists = true;
    // Ensure uniqueness
    while (exists) {
      code = generateReferralCode();
      exists = await mongoose.models.User.findOne({ referralCode: code });
    }
    this.referralCode = code;
  }
  next();
});

module.exports = mongoose.model('User', userSchema); 