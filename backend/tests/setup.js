// Centralised per-file setup for every test suite (injected via
// setupFilesAfterEnv). All suites share one connection to a disposable
// 'fashion_test' database; collections are emptied between tests so suites
// stay independent and the developer's 'fashion_house' data is never touched.
const mongoose = require('mongoose');

const TEST_URI = 'mongodb://127.0.0.1:27017/fashion_test';

// Keep the output clean: the global error handler logs a stack trace for every
// expected 4xx response, which would drown the summary otherwise.
let originalLog;
let originalError;
let originalWarn;

beforeAll(async () => {
  originalLog = console.log;
  originalError = console.error;
  originalWarn = console.warn;
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};

  await mongoose.connect(TEST_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

  console.log = originalLog;
  console.error = originalError;
  console.warn = originalWarn;
});

// Fresh collection state before every test.
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});
