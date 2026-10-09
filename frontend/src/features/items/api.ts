import { api } from "../../lib/axios";
import { mockRankableItems } from "../../mocks/rankableItems";
import { requireMockSession } from "../../mocks/accounts";
import { setMockSaved, withSavedState } from "../../mocks/savedItems";
import type { RankableItem } from "../../types/rankableItem";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export async function getItemById(itemId: string): Promise<RankableItem> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 200));
    const item = mockRankableItems.find((i) => i.id === itemId);
    if (!item) throw new Error("Ítem no encontrado");
    return withSavedState(item);
  }

  // BACKEND: ítem con childrenCount, childrenAverageRating y externalLinks ya resueltos, más
  // savedByCurrentUser y savesCount según la sesión (false para visitantes).
  // Los links externos deben ser validados/moderados por el servidor (spam, phishing, afiliados).
  const { data } = await api.get<RankableItem>(`/items/${itemId}`);
  return data;
}

export async function getItemChildren(itemId: string): Promise<RankableItem[]> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 200));
    return mockRankableItems
      .filter((i) => i.parentId === itemId)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((i) => withSavedState(i));
  }

  // BACKEND: hijos directos de la colección, ordenados por position
  const { data } = await api.get<RankableItem[]>(`/items/${itemId}/children`);
  return data;
}

export async function setItemSaved(itemId: string, saved: boolean): Promise<RankableItem> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 150));
    const me = requireMockSession();

    const item = mockRankableItems.find((i) => i.id === itemId);
    if (!item) throw new Error("Ítem no encontrado");

    setMockSaved(me.id, itemId, saved);
    return withSavedState(item);
  }

  // BACKEND: PUT /items/:id/save agrega a la lista y DELETE /items/:id/save la quita.
  // Ambos son idempotentes y devuelven el ítem con savedByCurrentUser y savesCount actualizados.
  // Sin sesión: 401.
  const { data } = saved
    ? await api.put<RankableItem>(`/items/${itemId}/save`)
    : await api.delete<RankableItem>(`/items/${itemId}/save`);
  return data;
}