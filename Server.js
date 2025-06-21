// // ===== BACKEND: Express Server =====
// // server/index.js
// const express = require('express');
// const cors = require('cors');
// const fs = require('fs');
// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.json());

// // Load JSON file
// const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));

// // Get all subjects
// app.get('/api/subjects', (req, res) => {
//   const subjects = data.subjects.map(s => s.subject);
//   res.json(subjects);
// });

// // Get chapters by subject
// app.get('/api/chapters/:subject', (req, res) => {
//   const subject = data.subjects.find(s => s.subject === req.params.subject);
//   if (!subject) return res.status(404).json({ error: 'Subject not found' });
//   const chapters = subject.chapters.map(c => c.chapterName);
//   res.json(chapters);
// });

// // Get questions by subject and chapter
// app.get('/api/questions/:subject/:chapter', (req, res) => {
//   const subject = data.subjects.find(s => s.subject === req.params.subject);
//   if (!subject) return res.status(404).json({ error: 'Subject not found' });
//   const chapter = subject.chapters.find(c => c.chapterName === req.params.chapter);
//   if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
//   res.json(chapter.questions);
// });

// // Evaluate answers
// app.post('/api/evaluate', (req, res) => {
//   const { questions, answers } = req.body;
//   let score = 0;
//   questions.forEach((q, index) => {
//     if (q.correctAnswer === answers[index]) score++;
//   });
//   res.json({ score, total: questions.length });
// });

// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


// // ===== FRONTEND: React App (src/App.js) =====
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// function App() {
//   const [subjects, setSubjects] = useState([]);
//   const [chapters, setChapters] = useState([]);
//   const [questions, setQuestions] = useState([]);
//   const [selectedSubject, setSelectedSubject] = useState('');
//   const [selectedChapter, setSelectedChapter] = useState('');
//   const [answers, setAnswers] = useState([]);
//   const [result, setResult] = useState(null);

//   useEffect(() => {
//     axios.get('http://localhost:5000/api/subjects')
//       .then(res => setSubjects(res.data));
//   }, []);

//   const handleSubjectChange = (e) => {
//     const sub = e.target.value;
//     setSelectedSubject(sub);
//     axios.get(`http://localhost:5000/api/chapters/${sub}`)
//       .then(res => setChapters(res.data));
//   };

//   const handleChapterChange = (e) => {
//     const chap = e.target.value;
//     setSelectedChapter(chap);
//     axios.get(`http://localhost:5000/api/questions/${selectedSubject}/${chap}`)
//       .then(res => {
//         setQuestions(res.data);
//         setAnswers(Array(res.data.length).fill(''));
//         setResult(null);
//       });
//   };

//   const handleAnswerChange = (index, value) => {
//     const newAnswers = [...answers];
//     newAnswers[index] = value;
//     setAnswers(newAnswers);
//   };

//   const handleSubmit = () => {
//     axios.post('http://localhost:5000/api/evaluate', {
//       questions,
//       answers
//     }).then(res => setResult(res.data));
//   };

//   return (
//     <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
//       <h1>Exam App</h1>
//       <label>Subject: </label>
//       <select onChange={handleSubjectChange} value={selectedSubject}>
//         <option value="">Select Subject</option>
//         {subjects.map(sub => <option key={sub}>{sub}</option>)}
//       </select>

//       <label style={{ marginLeft: '1rem' }}>Chapter: </label>
//       <select onChange={handleChapterChange} value={selectedChapter}>
//         <option value="">Select Chapter</option>
//         {chapters.map(chap => <option key={chap}>{chap}</option>)}
//       </select>

//       <hr />

//       {questions.map((q, i) => (
//         <div key={i}>
//           <p>{i + 1}. {q.question}</p>
//           {Object.entries(q.options).map(([key, value]) => (
//             <label key={key}>
//               <input
//                 type="radio"
//                 name={`question-${i}`}
//                 value={key}
//                 checked={answers[i] === key}
//                 onChange={() => handleAnswerChange(i, key)}
//               /> {key}) {value}
//             </label>
//           ))}
//         </div>
//       ))}

//       {questions.length > 0 && (
//         <button onClick={handleSubmit}>Submit</button>
//       )}

//       {result && (
//         <div>
//           <h3>Result:</h3>
//           <p>Score: {result.score} / {result.total}</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;




// const express = require('express');
// const cors = require('cors');
// const fs = require('fs');
// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.json());

// const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));

// app.get('/api/subjects', (req, res) => {
//   const subjects = data.subjects.map(s => s.subject);
//   res.json(subjects);
// });

// app.get('/api/chapters/:subject', (req, res) => {
//   const subject = data.subjects.find(s => s.subject === req.params.subject);
//   if (!subject) return res.status(404).json({ error: 'Subject not found' });
//   const chapters = subject.chapters.map(c => c.chapterName);
//   res.json(chapters);
// });

// app.get('/api/questions/:subject/:chapter', (req, res) => {
//   const subject = data.subjects.find(s => s.subject === req.params.subject);
//   if (!subject) return res.status(404).json({ error: 'Subject not found' });
//   const chapter = subject.chapters.find(c => c.chapterName === req.params.chapter);
//   if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
//   res.json(chapter.questions);
// });

// app.post('/api/evaluate', (req, res) => {
//   const { questions, answers } = req.body;
//   let score = 0;
//   questions.forEach((q, index) => {
//     if (q.correctAnswer === answers[index]) score++;
//   });
//   res.json({ score, total: questions.length });
// });

// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));



// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const examRoutes = require('./routes/examRoutes');

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());
// app.use('/api', examRoutes);

// app.listen(PORT, () => console.log(`🚀 Server running on http://localhos:${PORT}`));









// with DB 

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const examRoutes = require('./routes/examRoutes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api', examRoutes);

// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log('✅ MongoDB Connected');
//   app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
// }).catch(err => console.error('MongoDB Error:', err));


mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB Error:', err));

