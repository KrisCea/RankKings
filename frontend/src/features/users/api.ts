import { isAxiosError } from "axios";
import { api } from "../../lib/axios";
import { mockUsers } from "../../mocks/users";
import { mockUserProfiles } from "../../mocks/userProfiles";
import { getMockSessionUser } from "../../mocks/accounts";
import type { User, UserProfile, UserSummary } from "../../types/user";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

// MOCK: es el mismo objeto que usa el registro, para que los usuarios nuevos tengan perfil.
const mockUserProfilesState = mockUserProfiles;

export async function getCurrentUser(): Promise<User | null> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 300));
    return getMockSessionUser();
  }

  // BACKEND: GET /users/me. Responde 401 si no hay sesión; para la app eso significa "visitante".
  try {
    const { data } = await api.get<User>("/users/me");
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) return null;
    throw error;
  }
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

    const me = getMockSessionUser();
    if (!me) throw new Error("Debes iniciar sesión para seguir a otros usuarios");

    const profile = mockUserProfilesState[username];
    if (!profile) throw new Error("Usuario no encontrado");

    // MOCK: el backend real también debe rechazar que un usuario se siga a sí mismo
    if (profile.id === me.id) throw new Error("No puedes seguirte a ti mismo");

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

  // BACKEND: alterna seguir/dejar de seguir y devuelve el perfil con contadores recalculados.
  // Debe responder 401 sin sesión y 400 si el objetivo es el propio usuario.
  const { data } = await api.post<UserProfile>(`/users/${username}/follow`);
  return data;
}

export async function getShareContacts(): Promise<UserSummary[]> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 200));
    const me = getMockSessionUser();
    return mockUsers.filter((u) => u.id !== me?.id);
  }

  // BACKEND: el servidor decide quiénes aparecen (seguidores, chats recientes, etc.)
  const { data } = await api.get<UserSummary[]>("/users/me/share-contacts");
  return data;
}