const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^uncrypto$': '<rootDir>/node_modules/uncrypto/dist/crypto.node.cjs',
  },
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(uncrypto|iron-session|uuid|next/dist/server/web/spec-extension/adapters/next-request)/)'
  ]
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();

  // Custom fix to ensure transformIgnorePatterns works with next/jest
  config.transformIgnorePatterns = customJestConfig.transformIgnorePatterns;
  return config;
};
