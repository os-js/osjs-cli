module.exports = {
  collectCoverage: true,
  coverageReporters: ['lcov'],

  setupFilesAfterEnv: [
    '<rootDir>/__mocks__/setup.js'
  ],

  coveragePathIgnorePatterns: [
    'src/tasks/watch.js',
    '/node_modules/'
  ]
};
