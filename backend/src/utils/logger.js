const config = require('../config');

// Lightweight structured logger (no extra runtime dependency).
const emit = (level, args) => {
  const line = `[${new Date().toISOString()}] [${level}]`;
  if (level === 'ERROR') console.error(line, ...args);
  else if (level === 'WARN') console.warn(line, ...args);
  else console.log(line, ...args);
};

const logger = {
  debug: (...args) => {
    if (config.env !== 'production') emit('DEBUG', args);
  },
  info: (...args) => emit('INFO', args),
  warn: (...args) => emit('WARN', args),
  error: (...args) => emit('ERROR', args),
};

module.exports = logger;