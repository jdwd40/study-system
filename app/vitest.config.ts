import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 20000,
    hookTimeout: 20000,
    // Small VPS: cap parallel test workers so the suite never competes with a build or browser run.
    maxWorkers: 2,
    minWorkers: 1,
  },
});
