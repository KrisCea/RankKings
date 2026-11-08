import { api } from "../../lib/axios";
import type { SavedItem } from "../../types/savedItem";

export async function getSavedItems(): Promise<SavedItem[]> {
  const { data } = await api.get<SavedItem[]>("/users/me/saved");
  return data;
}