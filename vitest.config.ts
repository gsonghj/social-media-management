import { configDefaults, defineConfig } from "vitest/config"

const vitestConfig = defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    exclude: [...configDefaults.exclude, "**/.claude/**"],
  },
})

export default vitestConfig
