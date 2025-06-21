const fs = require('fs');
const path = require('path');

const getExamData = () => {
  const filePath = path.join(__dirname, '../data.json');
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
};

module.exports = { getExamData };