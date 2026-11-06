import { defineConfig } from 'vitest/config';
export default defineConfig({
  esbuild: { tsconfigRaw: JSON.stringify({ compilerOptions: { target: 'ES2020', experimentalDecorators: true, useDefineForClassFields: false } }) },
  test: { include: ['tests/**/*.test.ts'], maxWorkers: 1, fileParallelism: false }
});
