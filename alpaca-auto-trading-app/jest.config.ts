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
      testMatch: ['<rootDir>/**/__tests__/**/*.unit.(spec|test).{ts,tsx}'],
      coverageThreshold: { 
        global: { 
          lines: 85, 
          statements: 85, 
          functions: 85, 
          branches: 75 
        } 
      }
    },
    {
      displayName: 'integration',
      ...base,
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts', '<rootDir>/src/test/msw/setup.ts'],
      testMatch: ['<rootDir>/**/__tests__/**/*.int.(spec|test).{ts,tsx}'],
      coverageThreshold: { 
        global: { 
          lines: 75, 
          statements: 75, 
          functions: 70, 
          branches: 65 
        } 
      }
    }
  ],
};

export default config;
