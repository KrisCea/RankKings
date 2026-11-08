import { api } from "../../lib/axios";
import type { RankableItem } from "../../types/rankableItem";

export async function getItemById(itemId: string): Promise<RankableItem> {
  const { data } = await api.get<RankableItem>(`/items/${itemId}`);
  return data;
}

export async function getItemChildren(itemId: string): Promise<RankableItem[]> {
  const { data } = await api.get<RankableItem[]>(`/items/${itemId}/children`);
  return data;
}

export async function setItemSaved(itemId: string, saved: boolean): Promise<RankableItem> {
  const { data } = saved
    ? await api.put<RankableItem>(`/items/${itemId}/save`)
    : await api.delete<RankableItem>(`/items/${itemId}/save`);
  return data;
}