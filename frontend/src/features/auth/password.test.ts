import { describe, expect, it } from "vitest";
import { passwordSchema } from "./password";

describe("passwordSchema", () => {
  it("rechaza contraseñas cortas o predecibles y acepta una frase larga", () => {
    // Demasiado corta
    expect(passwordSchema.safeParse("Corta1!").success).toBe(false);

    // Predecibles aunque cumplan el largo mínimo
    expect(passwordSchema.safeParse("aaaaaaaaaaaa").success).toBe(false); // un carácter repetido
    expect(passwordSchema.safeParse("abcabcabcabc").success).toBe(false); // un bloque repetido
    expect(passwordSchema.safeParse("abcdefghijkl").success).toBe(false); // una secuencia
    expect(passwordSchema.safeParse("MiPassword2026!!").success).toBe(false); // contiene "password"

    // Una frase larga sin patrones es válida
    expect(passwordSchema.safeParse("mi gato come pescado azul").success).toBe(true);
  });
});