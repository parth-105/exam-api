const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const examRoutes = require('../routes/examRoutes');
const userRoutes = require('../routes/userRoutes');
const referralRoutes = require('../routes/referralRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', examRoutes);
app.use('/api/users', userRoutes);
app.use('/api/referral', referralRoutes);

app.get('/', (req, res) => {
  res.send('✅ Server is running successfully on Vercel!');
});

// const PORT = process.env.PORT || 6000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

module.exports = app; // Vercel requires this