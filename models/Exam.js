const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    a: { type: String, required: true },
    b: { type: String, required: true },
    c: { type: String, required: true },
    d: { type: String, required: true },
  },
  correctAnswer: { type: String, enum: ['a', 'b', 'c', 'd'], required: true }
});

const ChapterSchema = new mongoose.Schema({
  chapterName: String,
  questions: [QuestionSchema]
});

const SubjectSchema = new mongoose.Schema({
  subject: String,
  chapters: [ChapterSchema]
});

module.exports = mongoose.model('Exam', SubjectSchema);