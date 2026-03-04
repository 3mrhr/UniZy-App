import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$|src\/.*\.jsx$|vitest\.setup\.jsx$/,
    exclude: [],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.jsx',
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
