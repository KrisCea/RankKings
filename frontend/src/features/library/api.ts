import { api } from "../../lib/axios";
import { mockRankableItems } from "../../mocks/rankableItems";
import { requireMockSession } from "../../mocks/accounts";
import { listMockSaved, withSavedState } from "../../mocks/savedItems";
import type { SavedItem } from "../../types/savedItem";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export async function getSavedItems(): Promise<SavedItem[]> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 250));
    const me = requireMockSession();

    return listMockSaved(me.id)
      .flatMap(({ itemId, savedAt }) => {
        const item = mockRankableItems.find((i) => i.id === itemId);
        return item ? [{ item: withSavedState(item), savedAt }] : [];
      })
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  }

  // BACKEND: GET /users/me/saved. Solo devuelve la lista del usuario de la sesión (es privada),
  // ordenada por savedAt descendente. Sin sesión: 401.
  // Cuando haya paginación, el servidor también devolverá los contadores por categoría.
  const { data } = await api.get<SavedItem[]>("/users/me/saved");
  return data;
}