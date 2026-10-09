import { api } from "../../lib/axios";
import { AppError, AUTH_ERROR } from "../../lib/errors";
import {
  clearMockSession,
  findMockAccountByEmail,
  findMockUserById,
  registerMockAccount,
  resendMockVerification,
  setMockSession,
  verifyMockEmail,
} from "../../mocks/accounts";
import type {
  LoginInput,
  RegisterInput,
  RegisterResult,
  ResendVerificationResult,
} from "../../types/auth";
import type { User } from "../../types/user";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export async function login(input: LoginInput): Promise<User> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 300));
    const account = findMockAccountByEmail(input.email);

    // Mensaje genérico a propósito: no revela si el correo existe
    if (!account || account.password !== input.password) {
      throw new Error("Correo o contraseña incorrectos");
    }

    // Solo se avisa que falta verificar después de acertar la contraseña
    if (!account.emailVerified) {
      throw new AppError(
        AUTH_ERROR.EMAIL_NOT_VERIFIED,
        "Debes verificar tu correo antes de entrar"
      );
    }

    const user = findMockUserById(account.userId);
    if (!user) throw new Error("Correo o contraseña incorrectos");

    setMockSession(user.id);
    return user;
  }

  // BACKEND: POST /auth/login. Inicia la sesión con una cookie httpOnly y devuelve el usuario.
  // Credenciales inválidas: 401 { message }. Cuenta sin verificar (solo si la contraseña es
  // correcta): 403 { code: "EMAIL_NOT_VERIFIED", message }. Limitar intentos (rate limiting) y,
  // tras varios fallos, exigir captcha con el código CAPTCHA_REQUIRED.
  const { data } = await api.post<User>("/auth/login", input);
  return data;
}

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 400));
    return registerMockAccount(input); // lanza si el captcha, el correo o el usuario no son válidos
  }

  // BACKEND: POST /auth/register. El servidor debe:
  //  1. verificar captchaToken con Cloudflare (POST https://challenges.cloudflare.com/turnstile/v0/siteverify
  //     con la clave SECRETA y el token; rechazar si success es false). Sin esto el captcha no protege.
  //  2. validar la contraseña (largo, lista de contraseñas filtradas) y guardarla con hash (Argon2/bcrypt).
  //  3. crear la cuenta SIN verificar, NO iniciar sesión y enviar el correo con el enlace de un solo uso.
  // Correo o usuario repetido: 409 { message }. Captcha inválido: 400 { code: "CAPTCHA_FAILED" }.
  const { data } = await api.post<RegisterResult>("/auth/register", input);
  return data;
}

export async function verifyEmail(token: string): Promise<void> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 400));
    verifyMockEmail(token);
    return;
  }

  // BACKEND: POST /auth/verify-email { token } -> 204. Token inválido, usado o vencido:
  // 400 { code: "INVALID_TOKEN" | "TOKEN_EXPIRED", message }.
  await api.post("/auth/verify-email", { token });
}

export async function resendVerification(email: string): Promise<ResendVerificationResult> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 300));
    return resendMockVerification(email);
  }

  // BACKEND: POST /auth/resend-verification { email }. Responde SIEMPRE 204, exista o no la cuenta
  // (para no revelar qué correos están registrados), con límite de envíos por correo e IP.
  // Invalida el enlace anterior.
  await api.post("/auth/resend-verification", { email });
  return {};
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