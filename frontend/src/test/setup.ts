import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup, configure } from "@testing-library/react";

// Los datos simulados responden con retrasos de 150 a 400 ms: se les da margen
configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

// Sin globals, Testing Library no limpia solo el DOM entre pruebas
afterEach(() => cleanup());

// jsdom no implementa estas APIs del navegador que usa la aplicación
window.scrollTo = vi.fn();
window.scrollBy = vi.fn();
Element.prototype.scrollTo = vi.fn();

if (typeof CSS === "undefined" || typeof CSS.escape !== "function") {
  Object.defineProperty(globalThis, "CSS", {
    value: { escape: (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "\\$&") },
    configurable: true,
  });
}