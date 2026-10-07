import { mockCurrentUser, mockUsers } from "./users";
import { mockUserProfiles } from "./userProfiles";
import type { RegisterInput } from "../types/auth";
import type { User } from "../types/user";

interface MockAccount {
  email: string;
  password: string;
  userId: string;
}

// MOCK: credenciales de prueba. Solo existen mientras no haya backend.
const accounts: MockAccount[] = [
  { email: "crisc@rankkings.dev", password: "12345678", userId: mockCurrentUser.id },
  { email: "ana@rankkings.dev", password: "12345678", userId: mockUsers[0].id },
  { email: "sony@rankkings.dev", password: "12345678", userId: mockUsers[1].id },
  { email: "pedro@rankkings.dev", password: "12345678", userId: mockUsers[2].id },
];

const registeredUsers: User[] = [];

// MOCK: la sesión se recuerda entre recargas. Los usuarios registrados viven solo en memoria,
// así que tras recargar su sesión deja de ser válida.
const SESSION_KEY = "mockSessionUserId";

export function getMockSessionUserId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setMockSession(userId: string) {
  try {
    localStorage.setItem(SESSION_KEY, userId);
  } catch {
    // almacenamiento no disponible
  }
}

export function clearMockSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // almacenamiento no disponible
  }
}

export function findMockUserById(userId: string): User | null {
  if (userId === mockCurrentUser.id) return mockCurrentUser;

  const summary = mockUsers.find((u) => u.id === userId);
  if (summary) return { ...summary, isAuthenticated: true, role: "user" };

  return registeredUsers.find((u) => u.id === userId) ?? null;
}

export function getMockSessionUser(): User | null {
  const userId = getMockSessionUserId();
  return userId ? findMockUserById(userId) : null;
}

export function findMockAccountByEmail(email: string): MockAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return accounts.find((a) => a.email === normalized);
}

export function registerMockAccount(input: RegisterInput): User {
  const email = input.email.trim().toLowerCase();
  const username = input.username.trim().toLowerCase();
  const displayName = input.displayName.trim();

  if (accounts.some((a) => a.email === email)) {
    throw new Error("Ya existe una cuenta con ese correo");
  }
  if (mockUserProfiles[username]) {
    throw new Error("Ese nombre de usuario ya está en uso");
  }

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;

  const user: User = {
    id: `u${Date.now()}`,
    username,
    displayName,
    avatarUrl,
    accountType: "individual",
    isAuthenticated: true,
    role: "user",
  };

  registeredUsers.push(user);
  accounts.push({ email, password: input.password, userId: user.id });

  // El usuario nuevo también tiene perfil público (vista previa, página de perfil)
  mockUserProfiles[username] = {
    id: user.id,
    username,
    displayName,
    avatarUrl,
    accountType: "individual",
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    isFollowedByCurrentUser: false,
  };

  return user;
}