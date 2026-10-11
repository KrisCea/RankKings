import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: [fileURLToPath(new URL("./src/test/setup.ts", import.meta.url))],
    include: ["src/**/*.test.{ts,tsx}"],
    // Los datos simulados responden con retrasos de 150 a 400 ms y las pruebas de pantalla encadenan varios
    testTimeout: 20_000,
    // Siempre con datos y captcha de demostración, sin importar lo que diga tu .env
    env: { VITE_USE_MOCKS: "true", VITE_TURNSTILE_SITE_KEY: "" },
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        "src/**/*.d.ts",
        "src/types/**", // solo tipos: no generan código
        "src/main.tsx", // arranque de la app
        "src/app/router.tsx", // crea el router del navegador con las rutas (que sí se prueban)
        "src/app/providers.tsx", // conecta React Query
      ],
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      reportOnFailure: true, // muestra la tabla aunque alguna prueba falle
      thresholds: { lines: 70, statements: 70, functions: 70, branches: 60 },
    },
  },
});