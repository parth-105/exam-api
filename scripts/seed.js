// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const Exam = require('../models/Exam');
// const fs = require('fs');

// dotenv.config();

// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(async () => {
//   console.log('Connected to MongoDB');

//   // Load and insert data
//   const rawData = fs.readFileSync('data.json');
//   const jsonData = JSON.parse(rawData);

//   await Exam.deleteMany(); // optional: clear previous
//   await Exam.insertMany(jsonData.subjects);

//   console.log('✅ Data seeded successfully');
//   process.exit();
// }).catch(err => {
//   console.error('❌ MongoDB connection error:', err);
// });




// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const Exam = require('../models/Exam');
// const fs = require('fs');

// dotenv.config();

// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(async () => {
//   console.log('✅ Connected to MongoDB Atlas');

//   const rawData = fs.readFileSync('data.json');
//   const jsonData = JSON.parse(rawData);

//   await Exam.deleteMany(); // optional
//   await Exam.insertMany(jsonData.subjects);

//   console.log('✅ Seeded to MongoDB Atlas successfully');
//   process.exit();
// }).catch(err => {
//   console.error('❌ Atlas connection error:', err);
// });




const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Exam = require('../models/Exam');

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    await Exam.deleteMany({});
    await Exam.insertMany(data.subjects);

    console.log('✅ Data inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seed();
