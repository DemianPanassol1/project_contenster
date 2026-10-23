import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const apiRootPath = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(apiRootPath, 'src'),
      '@contenster/shared': resolve(apiRootPath, '..', 'shared', 'src', 'index.ts'),
    },
  },
  test: {
    coverage: {
      exclude: ['src/main.ts', 'src/database/**'],
      include: ['src/**/*.ts'],
      provider: 'v8',
    },
    environment: 'node',
    globals: true,
    include: ['src/**/*.spec.ts'],
    setupFiles: ['./test/runner/setup-environment.ts'],
  },
});
