import { mockCurrentUser, mockUsers } from "./users";
import { mockUserProfiles } from "./userProfiles";
import { AppError, AUTH_ERROR } from "../lib/errors";
import { MOCK_CAPTCHA_TOKEN } from "../features/auth/captcha";
import type { RegisterInput, RegisterResult } from "../types/auth";
import type { User } from "../types/user";

interface MockAccount {
  email: string;
  password: string;
  userId: string;
  emailVerified: boolean;
}

// MOCK: credenciales de prueba. Solo existen mientras no haya backend.
const accounts: MockAccount[] = [
  { email: "crisc@rankkings.dev", password: "12345678", userId: mockCurrentUser.id, emailVerified: true },
  { email: "ana@rankkings.dev", password: "12345678", userId: mockUsers[0].id, emailVerified: true },
  { email: "sony@rankkings.dev", password: "12345678", userId: mockUsers[1].id, emailVerified: true },
  { email: "pedro@rankkings.dev", password: "12345678", userId: mockUsers[2].id, emailVerified: true },
];

// MOCK: cuentas creadas en esta sesión. Viven en memoria: si recargas la página, desaparecen.
const registeredUsers: User[] = []; // con el correo verificado
const unverifiedUsers: User[] = []; // esperando el enlace del correo

// MOCK: tokens de verificación. BACKEND: 32 bytes aleatorios, se guarda solo su hash (SHA-256),
// vence en 24 h, es de un solo uso y reenviar invalida el anterior.
interface VerificationToken {
  email: string;
  expiresAt: number;
}
const verificationTokens = new Map<string, VerificationToken>();
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

// Tokens que el mock acepta como captcha resuelto: la casilla de demostración y el token que
// Turnstile entrega con sus claves de prueba.
const VALID_CAPTCHA_TOKENS = new Set([MOCK_CAPTCHA_TOKEN, "XXXX.DUMMY.TOKEN.XXXX"]);

// MOCK: la sesión se recuerda entre recargas (solo para las cuentas de prueba).
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

export function requireMockSession(): User {
  const user = getMockSessionUser();
  if (!user) throw new Error("Debes iniciar sesión");
  return user;
}

export function findMockAccountByEmail(email: string): MockAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return accounts.find((a) => a.email === normalized);
}

// Un solo enlace vigente por cuenta. Devuelve una ruta relativa para que, en modo demo, abrirla
// navegue dentro de la app sin recargar (recargar borraría las cuentas y tokens en memoria).
function issueVerificationUrl(email: string): string {
  for (const [token, entry] of verificationTokens) {
    if (entry.email === email) verificationTokens.delete(token);
  }

  const token = crypto.randomUUID();
  verificationTokens.set(token, { email, expiresAt: Date.now() + VERIFICATION_TTL_MS });
  return `/verify-email?token=${token}`;
}

function assertMockCaptcha(token: string) {
  if (!VALID_CAPTCHA_TOKENS.has(token)) {
    throw new AppError(
      AUTH_ERROR.CAPTCHA_FAILED,
      "No pudimos comprobar que eres una persona. Inténtalo de nuevo"
    );
  }
}

export function registerMockAccount(input: RegisterInput): RegisterResult {
  assertMockCaptcha(input.captchaToken);

  const email = input.email.trim().toLowerCase();
  const username = input.username.trim().toLowerCase();
  const displayName = input.displayName.trim();

  if (accounts.some((a) => a.email === email)) {
    throw new Error("Ya existe una cuenta con ese correo");
  }
  if (mockUserProfiles[username] || unverifiedUsers.some((u) => u.username === username)) {
    throw new Error("Ese nombre de usuario ya está en uso");
  }

  const user: User = {
    id: `u${Date.now()}`,
    username,
    displayName,
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`,
    accountType: "individual",
    isAuthenticated: true,
    role: "user",
  };

  unverifiedUsers.push(user);
  accounts.push({ email, password: input.password, userId: user.id, emailVerified: false });

  return { email, devVerificationUrl: issueVerificationUrl(email) };
}

export function verifyMockEmail(token: string): void {
  const entry = verificationTokens.get(token);
  if (!entry) {
    throw new AppError(AUTH_ERROR.INVALID_TOKEN, "El enlace no es válido o ya fue usado");
  }
  if (entry.expiresAt < Date.now()) {
    throw new AppError(AUTH_ERROR.TOKEN_EXPIRED, "El enlace venció. Pide uno nuevo");
  }

  const account = accounts.find((a) => a.email === entry.email);
  const pending = account ? unverifiedUsers.find((u) => u.id === account.userId) : undefined;

  verificationTokens.delete(token); // un solo uso

  if (!account || !pending) {
    throw new AppError(AUTH_ERROR.INVALID_TOKEN, "El enlace no es válido o ya fue usado");
  }

  account.emailVerified = true;
  unverifiedUsers.splice(unverifiedUsers.indexOf(pending), 1);
  registeredUsers.push(pending);

  // El perfil público existe desde que la cuenta queda verificada
  mockUserProfiles[pending.username] = {
    id: pending.id,
    username: pending.username,
    displayName: pending.displayName,
    avatarUrl: pending.avatarUrl,
    accountType: "individual",
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    isFollowedByCurrentUser: false,
  };
}

// Responde igual exista o no la cuenta (no revela qué correos están registrados)
export function resendMockVerification(email: string): { devVerificationUrl?: string } {
  const normalized = email.trim().toLowerCase();
  const account = accounts.find((a) => a.email === normalized);

  if (!account || account.emailVerified) return {};
  return { devVerificationUrl: issueVerificationUrl(normalized) };
}