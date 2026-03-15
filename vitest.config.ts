import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '@': resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'server/api/**/*.ts',
        'server/websocket.ts',
        'models/**/*.ts',
        'server/utils/**/*.ts',
      ],
      exclude: [
        'node_modules/**',
        '.nuxt/**',
        '.output/**',
        'tests/**',
      ],
    },
  },
})
