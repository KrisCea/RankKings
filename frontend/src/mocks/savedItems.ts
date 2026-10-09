import { getMockSessionUser } from "./accounts";
import type { RankableItem } from "../types/rankableItem";

// MOCK: lista personal por usuario (userId -> itemId -> fecha en que se agregó).
// Vive en memoria y se pierde al recargar; el backend la guardará en la base de datos.
const savedByUser: Record<string, Record<string, string>> = {
  // Datos de ejemplo para la cuenta de prueba "crisc" (id "1"), para ver la biblioteca con contenido
  "1": {
    ri1: "2026-09-25T10:00:00Z",
    ri3: "2026-09-26T18:30:00Z",
    ri7: "2026-09-28T09:15:00Z",
    ri2: "2026-09-30T20:00:00Z",
  },
};

function countSaves(itemId: string): number {
  return Object.values(savedByUser).filter((items) => itemId in items).length;
}

export function setMockSaved(userId: string, itemId: string, saved: boolean) {
  const items = (savedByUser[userId] ??= {});
  if (saved) {
    items[itemId] ??= new Date().toISOString(); // si ya estaba, conserva la fecha original
  } else {
    delete items[itemId];
  }
}

export function listMockSaved(userId: string): { itemId: string; savedAt: string }[] {
  return Object.entries(savedByUser[userId] ?? {}).map(([itemId, savedAt]) => ({
    itemId,
    savedAt,
  }));
}

// Agrega al ítem lo que depende de quién consulta (el backend lo resuelve con la sesión)
export function withSavedState(item: RankableItem): RankableItem {
  const viewerId = getMockSessionUser()?.id;

  return {
    ...item,
    savedByCurrentUser: viewerId ? item.id in (savedByUser[viewerId] ?? {}) : false,
    savesCount: item.savesCount + countSaves(item.id),
  };
}