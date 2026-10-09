import { defineConfig, devices } from "@playwright/test";

// Puerto propio para no chocar con tu `npm run dev` de siempre
const PORT = 5174;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    timeout: 120_000,
    reuseExistingServer: false,
    // Las variables del proceso tienen prioridad sobre tu .env: así las pruebas siempre corren con
    // datos de demostración y con la casilla de captcha de demostración (sin Turnstile)
    env: { VITE_USE_MOCKS: "true", VITE_TURNSTILE_SITE_KEY: "" },
  },
});