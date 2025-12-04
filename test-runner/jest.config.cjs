module.exports = {
  rootDir: '..',

  testEnvironment: require.resolve('jest-environment-jsdom'),

  setupFilesAfterEnv: ['<rootDir>/test-runner/setupTests.ts'],

  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/test-runner/tsconfig.json',
      },
    ],
  },

  testMatch: [
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.test.tsx',
  ],

  moduleNameMapper: {
    '\\.(css|scss|sass|less)$': 'identity-obj-proxy',
  },

  testEnvironmentOptions: {
    url: 'http://localhost',
    userAgent: 'Agent/007',
  },
  transformIgnorePatterns: [
    "node_modules/(?!(axios)/)",
    "<rootDir>/src/.*/__mocks__/.*"
  ],
};
