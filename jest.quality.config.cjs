const base = require('./jest.config.js');
module.exports = {
  ...base,
  testRegex: '(\\.spec\\.ts|\\.e2e-spec\\.ts)$',
  setupFiles: ['<rootDir>/test/e2e/setup-env.ts'],
  testTimeout: 30000,
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts'],
  coverageDirectory: 'coverage/quality',
  coverageThreshold: { global: { statements: 90, branches: 80, functions: 90, lines: 90 } },
};
