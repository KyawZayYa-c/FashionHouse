const connectDB = require('./config/db');
const config = require('./config');
const app = require('./app');

const start = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Could not connect to MongoDB. Server not started.');
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    console.log(
      `Server running in ${config.env} mode on port ${config.port}`
    );
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`${signal} received, closing server...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

start();

module.exports = app;