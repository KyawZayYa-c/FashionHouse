const fs = require('fs');
const path = require('path');

const deleteFile = (filePath) => {
  const fullPath = path.join(__dirname, '../', filePath);
  console.warn('Full Path to delete:', fullPath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = { deleteFile };
