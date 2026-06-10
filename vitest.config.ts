import { defineConfig } from 'vitest/config'

// Unit tests run in Node by default (pure logic). DOM/canvas/WebGL-dependent
// behavior is covered by the Playwright smoke suite (npm run smoke), since
// jsdom has no real canvas/WebGL implementation.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    globals: false,
  },
})
