/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'identity-obj-proxy',
    '^phaser$': '<rootDir>/src/tests/__mocks__/phaserMock.ts'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  roots: [
    '<rootDir>/src'
  ],
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx)',
    '**/*.test.(ts|tsx)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/main.ts',
    '!src/**/*.d.ts',
    '!src/scenes/**/*',
    '!src/entities/Player.ts',
    '!src/entities/FarmMap.ts',
    '!src/entities/PetEntity.ts',
    '!src/systems/WeatherSystem.ts',
    '!src/ui/**/*',
    '!src/utils/TextureGenerator.ts',
    '!src/ecs/**/*',
    '!src/tests/**/*'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: ['text', 'lcov', 'html'],
  setupFiles: ['<rootDir>/src/tests/setup.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json'
      }
    ]
  },
  extensionsToTreatAsEsm: ['.ts'],
  testTimeout: 10000
};
