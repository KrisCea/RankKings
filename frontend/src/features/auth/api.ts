import { api } from "../../lib/axios";
import {
  clearMockSession,
  findMockAccountByEmail,
  findMockUserById,
  registerMockAccount,
  setMockSession,
} from "../../mocks/accounts";
import type { LoginInput, RegisterInput } from "../../types/auth";
import type { User } from "../../types/user";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export async function login(input: LoginInput): Promise<User> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 300));
    const account = findMockAccountByEmail(input.email);
    const user = account ? findMockUserById(account.userId) : null;

    // Mensaje genérico a propósito: tampoco hay que revelar si el correo existe
    if (!account || !user || account.password !== input.password) {
      throw new Error("Correo o contraseña incorrectos");
    }

    setMockSession(user.id);
    return user;
  }

  // BACKEND: POST /auth/login. Inicia la sesión con una cookie httpOnly y devuelve el usuario.
  // Credenciales inválidas: 401 con { message }. Conviene limitar los intentos (rate limiting).
  const { data } = await api.post<User>("/auth/login", input);
  return data;
}

export async function registerUser(input: RegisterInput): Promise<User> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 400));
    const user = registerMockAccount(input); // lanza si el correo o el usuario ya existen
    setMockSession(user.id);
    return user;
  }

  // BACKEND: POST /auth/register. Guarda la contraseña con hash (bcrypt/argon2), deja la sesión
  // iniciada y devuelve el usuario. Correo o usuario repetido: 409 con { message }.
  const { data } = await api.post<User>("/auth/register", input);
  return data;
}

export async function logout(): Promise<void> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 150));
    clearMockSession();
    return;
  }

  // BACKEND: POST /auth/logout. Invalida la sesión y borra la cookie.
  await api.post("/auth/logout");
}