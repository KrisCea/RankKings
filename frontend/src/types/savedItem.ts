import type { RankableItem } from "./rankableItem";

export interface SavedItem {
  item: RankableItem;
  savedAt: string; // ISO: cuándo se agregó a la lista
}