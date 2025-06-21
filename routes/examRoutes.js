const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getChapters,
  getQuestions,
  evaluateAnswers
} = require('../controllers/examController');

router.get('/subjects', getSubjects);
router.get('/chapters/:subject', getChapters);
router.get('/questions/:subject/:chapter', getQuestions);
router.post('/evaluate', evaluateAnswers);

module.exports = router;