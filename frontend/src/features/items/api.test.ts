import { describe, expect, it } from "vitest";
import { getItemById, getItemChildren, setItemSaved } from "./api";
import { getSavedItems } from "../library/api";
import { setMockSession } from "../../mocks/accounts";

describe("api de ítems y biblioteca (datos simulados)", () => {
  it("devuelve un ítem con su estado de lista según quién consulta, y sus hijos en orden", async () => {
    const asVisitor = await getItemById("ri2");
    expect(asVisitor.title).toBe("Random Access Memories");
    expect(asVisitor.savedByCurrentUser).toBe(false);
    expect(asVisitor.savesCount).toBe(613); // 612 de base + la lista de crisc

    setMockSession("1");
    expect((await getItemById("ri2")).savedByCurrentUser).toBe(true);

    await expect(getItemById("no-existe")).rejects.toThrow("Ítem no encontrado");

    expect((await getItemChildren("ri2")).map((item) => item.id)).toEqual(["ri5", "ri6", "ri7"]);
    expect(await getItemChildren("ri1")).toEqual([]);
  });

  it("agrega y quita ítems de la lista personal, y la biblioteca los ordena por fecha", async () => {
    await expect(setItemSaved("ri4", true)).rejects.toThrow("Debes iniciar sesión");
    await expect(getSavedItems()).rejects.toThrow("Debes iniciar sesión");

    setMockSession("1");
    const saved = await setItemSaved("ri4", true);
    expect(saved.savedByCurrentUser).toBe(true);
    expect(saved.savesCount).toBe(98);

    const library = await getSavedItems();
    expect(library.map((entry) => entry.item.id).sort()).toEqual(["ri1", "ri2", "ri3", "ri4", "ri7"]);
    const times = library.map((entry) => new Date(entry.savedAt).getTime());
    expect(times).toEqual([...times].sort((a, b) => b - a)); // más reciente primero

    // Agregarlo de nuevo no cambia la fecha original
    const before = library.find((entry) => entry.item.id === "ri4")?.savedAt;
    await setItemSaved("ri4", true);
    const after = (await getSavedItems()).find((entry) => entry.item.id === "ri4")?.savedAt;
    expect(after).toBe(before);

    const removed = await setItemSaved("ri4", false);
    expect(removed.savedByCurrentUser).toBe(false);
    expect(removed.savesCount).toBe(97);
    expect(await getSavedItems()).toHaveLength(4);

    await expect(setItemSaved("no-existe", true)).rejects.toThrow("Ítem no encontrado");
  });
});