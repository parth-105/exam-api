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
const awardPoints = require('../utils/awardPoints');

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

// Award points for quiz/exam and trigger referral commission
const evaluateAnswers = async (req, res) => {
  const { userId, questions, answers, pointsPerCorrect = 1 } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  let score = 0;
  questions.forEach((q, i) => {
    if (q.correctAnswer === answers[i]) score++;
  });
  const totalPoints = score * pointsPerCorrect;
  if (totalPoints > 0) {
    await awardPoints(userId, totalPoints, 'Quiz/Exam');
  }
  res.json({ score, total: questions.length, pointsAwarded: totalPoints });
};

module.exports = {
  getSubjects,
  getChapters,
  getQuestions,
  evaluateAnswers
};
