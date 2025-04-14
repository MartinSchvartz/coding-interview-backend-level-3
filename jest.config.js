/** @type {import('jest').Config} */
const config = {
    verbose: true,
    transform: {
        '^.+\\.(t|j)sx?$': '@swc/jest',
    },
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    collectCoverageFrom: [
        'src/**/*.{js,ts}',
        '!src/index.ts',
        '!src/**/*.d.ts', 
        '!src/**/tests/**/*',
    ],
    coverageReporters: ['text', 'lcov'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testPathIgnorePatterns: ['/node_modules/'],
};

module.exports = config;
   