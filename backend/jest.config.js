module.exports = {
  testEnvironment: 'node',
  preset: 'jest-preset-angular', // or 'ts-jest' if using TypeScript
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.test.ts',
  ],
  setupFilesAfterTimeout: [
    '<rootDir>/src/utils/jest.setup.js'
  ],
  moduleNameMapper: {
    // Map path aliases to actual paths
    '^@/src/(.*)$': '<rootDir>/src/$1',
    '^@/tests/(.*)$': '<rootDir>/tests/$1',
  },
  testTimeout: 30000,
  verbose: true,
};