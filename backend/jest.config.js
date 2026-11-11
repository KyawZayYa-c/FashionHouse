// Jest runs the CommonJS backend suite (supertest against the exported Express
// app). The old config referenced 'jest-preset-angular', which was never
// installed here, and used a misspelled 'setupFilesAfterTimeout' key — both
// removed.
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  clearMocks: true,
};
