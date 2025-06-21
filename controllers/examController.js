// const { getExamData } = require('../utils/loadData');

// const getSubjects = (req, res) => {
//   const data = getExamData();
//   const subjects = data.subjects.map(s => s.subject);
//   res.json(subjects);
// };

// const getChapters = (req, res) => {
//   const data = getExamData();
//   const subject = data.subjects.find(s => s.subject === req.params.subject);
//   if (!subject) return res.status(404).json({ error: 'Subject not found' });
//   res.json(subject.chapters.map(c => c.chapterName));
// };

// const getQuestions = (req, res) => {
//   const data = getExamData();
//   const subject = data.subjects.find(s => s.subject === req.params.subject);
//   if (!subject) return res.status(404).json({ error: 'Subject not found' });
//   const chapter = subject.chapters.find(c => c.chapterName === req.params.chapter);
//   if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
//   res.json(chapter.questions);
// };

// const evaluateAnswers = (req, res) => {
//   const { questions, answers } = req.body;
//   let score = 0;
//   questions.forEach((q, i) => {
//     if (q.correctAnswer === answers[i]) score++;
//   });
//   res.json({ score, total: questions.length });
// };

// module.exports = {
//   getSubjects,
//   getChapters,
//   getQuestions,
//   evaluateAnswers
// };




// with DB
const Exam = require('../models/Exam');

const getSubjects = async (req, res) => {
  const subjects = await Exam.find({}, 'subject');
  res.json(subjects.map(s => s.subject));
};

const getChapters = async (req, res) => {
  const subject = await Exam.findOne({ subject: req.params.subject });
  if (!subject) return res.status(404).json({ error: 'Subject not found' });
  res.json(subject.chapters.map(c => c.chapterName));
};

const getQuestions = async (req, res) => {
  const subject = await Exam.findOne({ subject: req.params.subject });
  if (!subject) return res.status(404).json({ error: 'Subject not found' });
  const chapter = subject.chapters.find(c => c.chapterName === req.params.chapter);
  if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
  res.json(chapter.questions);
};

const evaluateAnswers = (req, res) => {
  const { questions, answers } = req.body;
  let score = 0;
  questions.forEach((q, i) => {
    if (q.correctAnswer === answers[i]) score++;
  });
  res.json({ score, total: questions.length });
};

module.exports = {
  getSubjects,
  getChapters,
  getQuestions,
  evaluateAnswers
};
