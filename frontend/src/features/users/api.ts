import { api } from "../../lib/axios.ts";
import { mockCurrentUser } from "../../mocks/users";
import type { User } from "../../types/user";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export async function getCurrentUser(): Promise<User | null> {
  if (USE_MOCKS) {
    // simula latencia de red, útil para probar loading states
    await new Promise((r) => setTimeout(r, 300));
    return mockCurrentUser;
  }

  const { data } = await api.get<User>("/users/me");
  return data;
}