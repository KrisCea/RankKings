import { api } from "../../lib/axios";
import { mockUserProfiles } from "../../mocks/userProfiles";
import { mockCurrentUser, mockUsers } from "../../mocks/users";
import type { User, UserProfile, UserSummary } from "../../types/user";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

// MOCK: estado mutable en memoria, simula persistencia mientras no hay backend.
const mockUserProfilesState: Record<string, UserProfile> = { ...mockUserProfiles };

export async function getCurrentUser(): Promise<User | null> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 300));
    return mockCurrentUser;
  }

  const { data } = await api.get<User>("/users/me");
  return data;
}

export async function getUserProfile(username: string): Promise<UserProfile> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 200));
    const profile = mockUserProfilesState[username];
    if (!profile) throw new Error("Usuario no encontrado");
    return profile;
  }

  // BACKEND: perfil público con contadores ya calculados
  const { data } = await api.get<UserProfile>(`/users/${username}`);
  return data;
}

export async function toggleFollow(username: string): Promise<UserProfile> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 150));
    const profile = mockUserProfilesState[username];
    if (!profile) throw new Error("Usuario no encontrado");

    // MOCK: el backend real también debe rechazar que un usuario se siga a sí mismo
    if (profile.id === mockCurrentUser.id) {
      throw new Error("No puedes seguirte a ti mismo");
    }

    const updated: UserProfile = {
      ...profile,
      isFollowedByCurrentUser: !profile.isFollowedByCurrentUser,
      followersCount: profile.isFollowedByCurrentUser
        ? profile.followersCount - 1
        : profile.followersCount + 1,
    };

    mockUserProfilesState[username] = updated;
    return updated;
  }

  // BACKEND: alterna seguir/dejar de seguir. Debe responder error si el objetivo es el propio usuario.
  const { data } = await api.post<UserProfile>(`/users/${username}/follow`);
  return data;
}

export async function getShareContacts(): Promise<UserSummary[]> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 200));
    return mockUsers;
  }

  // BACKEND: el servidor decide quiénes aparecen (seguidores, chats recientes, etc.)
  const { data } = await api.get<UserSummary[]>("/users/me/share-contacts");
  return data;
}