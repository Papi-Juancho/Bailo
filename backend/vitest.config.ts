import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    restoreMocks: true,
    include: ['test/**/*.spec.ts'],
    coverage: {
      enabled: true,
      include: ['**/v2/**/*.ts', '**/middleware/**/*.ts'],
    },
  },
})
