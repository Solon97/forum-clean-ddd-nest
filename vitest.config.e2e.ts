import swc from 'unplugin-swc';
import tsConfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: ['./test/e2e/global-setup-e2e.ts'],
    setupFiles: ['./test/e2e/setup-e2e.ts'],
    globals: true,
    root: './',
    maxWorkers: 1,
    projects: [
      {
        extends: true,
        test: {
          name: 'auth-e2e',
          include: ['src/infra/resources/auth/__test__/**/*.e2e-spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'question-e2e',
          include: ['src/infra/resources/question/__test__/**/*.e2e-spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'answer-e2e',
          include: ['src/infra/resources/answer/__test__/**/*.e2e-spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'attachment-e2e',
          include: ['src/infra/resources/attachment/__test__/**/*.e2e-spec.ts'],
        },
      },
    ],
  },
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
