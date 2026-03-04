import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    // By default, use the node environment for backend tests (e.g. src/lib)
    environment: 'node',
    // Example of opting into jsdom for React components:
    // environmentMatchGlobs: [
    //   ['tests/components/**', 'jsdom']
    // ],
    alias: {
      '@': resolve(__dirname, './src'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js', 'src/**/*.jsx'],
    },
  },
});
