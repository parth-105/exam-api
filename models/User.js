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
  pointsHistory: { type: [pointsHistorySchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 