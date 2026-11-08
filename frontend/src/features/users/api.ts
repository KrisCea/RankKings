import { isAxiosError } from "axios";
import { api } from "../../lib/axios";
import type { User, UserProfile, UserSummary } from "../../types/user";

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await api.get<User>("/users/me");
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) return null;
    throw error;
  }
}

export async function getUserProfile(username: string): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>(`/users/${username}`);
  return data;
}

export async function toggleFollow(username: string): Promise<UserProfile> {
  const { data } = await api.post<UserProfile>(`/users/${username}/follow`);
  return data;
}

export async function getShareContacts(): Promise<UserSummary[]> {
  const { data } = await api.get<UserSummary[]>("/users/me/share-contacts");
  return data;
}