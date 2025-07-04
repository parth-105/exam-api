const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  code: { type: String }, // Play Store code sent to user upon approval
  requestedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema); 