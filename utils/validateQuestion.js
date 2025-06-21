const isValidQuestion = (question) => {
  if (!question || typeof question !== 'object') return false;
  const { question: q, options, correctAnswer } = question;
  if (!q || typeof q !== 'string') return false;
  if (!options || typeof options !== 'object') return false;
  const keys = ['a', 'b', 'c', 'd'];
  for (let key of keys) {
    if (!options[key] || typeof options[key] !== 'string') return false;
  }
  if (!keys.includes(correctAnswer)) return false;
  return true;
};

module.exports = { isValidQuestion };