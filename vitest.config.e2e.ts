import swc from 'unplugin-swc';
import tsConfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: ['./test/global-setup-e2e.ts'],
    setupFiles: ['./test/setup-e2e.ts'],
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    root: './',
    maxWorkers: 1,
  },
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
