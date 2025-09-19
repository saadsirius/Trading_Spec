import type { Config } from 'jest';

const base: Partial<Config> = {
  testEnvironment: 'jsdom',
  transform: { '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  },
  setupFiles: ['whatwg-fetch'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts'
  ],
};

const config: Config = {
  projects: [
    {
      displayName: 'unit',
      ...base,
      testMatch: ['<rootDir>/**/__tests__/**/*.unit.(spec|test).{ts,tsx}']
    },
    {
      displayName: 'integration',
      ...base,
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts', '<rootDir>/src/test/msw/setup.ts'],
      testMatch: ['<rootDir>/**/__tests__/**/*.int.(spec|test).{ts,tsx}']
    }
  ],
  coverageThreshold: { 
    global: { 
      lines: 80, 
      statements: 80, 
      functions: 80, 
      branches: 70 
    } 
  }
};

export default config;
