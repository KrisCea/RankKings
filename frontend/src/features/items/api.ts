import { api } from "../../lib/axios";
import type { CategoryId } from "../../categories/types";
import type { RankableItem } from "../../types/rankableItem";

export interface NewRankableItemInput {
  category: CategoryId;
  title: string;
  creatorName: string;
  description?: string;
  year?: number;
  identifiers: Record<string, string>;
  cover: File;
}

export async function createRankableItem(input: NewRankableItemInput): Promise<RankableItem> {
  const formData = new FormData();
  formData.append("category", input.category);
  formData.append("title", input.title);
  formData.append("creatorName", input.creatorName);
  formData.append("identifiers", JSON.stringify(input.identifiers));
  formData.append("cover", input.cover);
  if (input.description) formData.append("description", input.description);
  if (input.year !== undefined) formData.append("year", String(input.year));

  const { data } = await api.post<RankableItem>("/items", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

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