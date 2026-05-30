import { defineConfig } from 'vitest/config';
import checker from 'vite-plugin-checker';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint src test --ext .ts',
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
