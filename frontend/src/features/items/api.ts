import { api } from "../../lib/axios";
import { mockRankableItems } from "../../mocks/rankableItems";
import type { RankableItem } from "../../types/rankableItem";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export async function getItemById(itemId: string): Promise<RankableItem> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 200));
    const item = mockRankableItems.find((i) => i.id === itemId);
    if (!item) throw new Error("Ítem no encontrado");
    return item;
  }

  // BACKEND: ítem con childrenCount, childrenAverageRating y externalLinks ya resueltos.
  // Los links externos deben ser validados/moderados por el servidor (spam, phishing, afiliados).
  const { data } = await api.get<RankableItem>(`/items/${itemId}`);
  return data;
}

export async function getItemChildren(itemId: string): Promise<RankableItem[]> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 200));
    return mockRankableItems
      .filter((i) => i.parentId === itemId)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  // BACKEND: hijos directos de la colección, ordenados por position
  const { data } = await api.get<RankableItem[]>(`/items/${itemId}/children`);
  return data;
}