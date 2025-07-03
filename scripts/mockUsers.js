const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const users = [
  {
    username: 'alice',
    email: 'alice@example.com',
    password: 'password123',
    totalPoints: 120,
    pointsHistory: [
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), points: 50, game: 'quiz' }, // 2 days ago
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), points: 70, game: 'puzzle' } // 5 days ago
    ]
  },
  {
    username: 'bob',
    email: 'bob@example.com',
    password: 'password123',
    totalPoints: 90,
    pointsHistory: [
      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), points: 40, game: 'quiz' }, // 1 day ago
      { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), points: 50, game: 'puzzle' } // 6 days ago
    ]
  },
  {
    username: 'charlie',
    email: 'charlie@example.com',
    password: 'password123',
    totalPoints: 60,
    pointsHistory: [
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), points: 60, game: 'quiz' } // 3 days ago
    ]
  }
];

async function insertMockUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User({
      ...userData,
      password: hashedPassword
    });
    await user.save();
    console.log(`Inserted user: ${user.username}`);
  }
  await mongoose.disconnect();
  console.log('Done inserting mock users.');
}

insertMockUsers().catch(err => {
  console.error(err);
  process.exit(1);
}); 