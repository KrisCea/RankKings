import { describe, expect, it } from "vitest";
import { containsPersonalInfo, estimateStrength, isPredictable } from "./password";

describe("estimateStrength", () => {
  it("clasifica las contraseñas según su largo y su variedad", () => {
    expect(estimateStrength("")).toBe(0);
    expect(estimateStrength("corta")).toBe(0); // menos de 12 caracteres
    expect(estimateStrength("aaaaaaaaaaaa")).toBe(1); // predecible
    expect(estimateStrength("correcaballito")).toBe(1); // 14 letras, sin variedad
    expect(estimateStrength("tengoungatonegro")).toBe(2); // 16 letras
    expect(estimateStrength("Gato-Negro-26")).toBe(2); // 13 caracteres, 4 tipos
    expect(estimateStrength("Gato-Negro-Corre-26")).toBe(3); // 19 caracteres, 4 tipos
    expect(estimateStrength("Mi-gato-negro-Corre-26!")).toBe(4); // 23 caracteres, 4 tipos
  });

  it("penaliza las contraseñas que contienen datos personales", () => {
    expect(estimateStrength("rankingcristobal2026", ["cristobal"])).toBe(1);
    expect(estimateStrength("rankingcristobal2026", ["otra"])).toBeGreaterThan(1);
  });
});

describe("containsPersonalInfo e isPredictable", () => {
  it("detecta datos personales ignorando mayúsculas y partes muy cortas", () => {
    expect(containsPersonalInfo("MiCristobalGato", ["cristobal"])).toBe(true);
    expect(containsPersonalInfo("miAnaPassword", ["ana"])).toBe(false); // menos de 4 caracteres
    expect(containsPersonalInfo("cualquier cosa", [])).toBe(false);
  });

  it("reconoce patrones predecibles", () => {
    expect(isPredictable("qwertyuiopas")).toBe(true);
    expect(isPredictable("abababababab")).toBe(true);
    expect(isPredictable("zyxwvutsrqpo")).toBe(true); // secuencia descendente
    expect(isPredictable("mi gato come pescado")).toBe(false);
  });
});