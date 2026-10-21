const pino = require('pino');
const config = require('../../config');

const isDevelopment = config.env === 'development';

const logger = pino({
  level: config.env === 'production' ? 'info' : 'debug',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    service: 'saas-starter-kit-backend',
  },
});

module.exports = logger;
