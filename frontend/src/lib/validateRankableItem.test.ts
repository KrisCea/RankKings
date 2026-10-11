import { describe, expect, it, vi } from "vitest";
import { validateIdentifiers } from "./validateRankableItem";

describe("validateIdentifiers", () => {
  it("calcula el estado de verificación según los identificadores", () => {
    // Libro: el ISBN es obligatorio y certifica
    expect(validateIdentifiers("books", {}).status).toBe("unverified");
    expect(validateIdentifiers("books", { isbn: "9780307474728" }).status).toBe("verified");

    // Música: el género es obligatorio, pero solo ISRC o ISMN certifican
    expect(validateIdentifiers("music", { genre: "Rock" }).status).toBe("partial");
    expect(validateIdentifiers("music", { genre: "Rock", isrc: "FR-ZYX-13-00001" }).status).toBe(
      "verified"
    );

    // Arte: nada es obligatorio ni certifica por ahora
    expect(validateIdentifiers("art", {}).status).toBe("partial");

    // Mientras el backend no valide, no se bloquea la publicación
    expect(validateIdentifiers("books", {}).valid).toBe(true);
    expect(validateIdentifiers("books", {}).missingRequired).toEqual(["isbn"]);
  });

  it("bloquea cuando se exigen los identificadores obligatorios", async () => {
    vi.resetModules();
    vi.doMock("../constants/config", () => ({ ENFORCE_REQUIRED_IDENTIFIERS: true }));
    const { validateIdentifiers: strict } = await import("./validateRankableItem");

    expect(strict("books", {}).valid).toBe(false);
    expect(strict("books", { isbn: "9780307474728" }).valid).toBe(true);

    vi.doUnmock("../constants/config");
  });
});