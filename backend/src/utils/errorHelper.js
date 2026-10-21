const fs = require('fs');
const path = require('path');

const ensureErrorDir = () => {
  const errorDir = path.join(__dirname, '../errors');
  if (!fs.existsSync(errorDir)) {
    fs.mkdirSync(errorDir, { recursive: true });
  }
  return errorDir;
};

const writeErrorToFile = (errorData) => {
  try {
    const errorDir = ensureErrorDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `error-${timestamp}.json`;
    const filePath = path.join(errorDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(errorData, null, 2), 'utf-8');
    return filePath;
  } catch (err) {
    console.error('Failed to write error to file:', err);
    return null;
  }
};

const readErrorFile = (fileName) => {
  try {
    const filePath = path.join(__dirname, '../errors', fileName);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to read error file:', err);
    return null;
  }
};

module.exports = {
  writeErrorToFile,
  readErrorFile,
};
