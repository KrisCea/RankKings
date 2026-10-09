import { isAxiosError } from "axios";

const DEFAULT_MESSAGE = "Ocurrió un error. Inténtalo de nuevo.";

// Códigos estables para que la interfaz pueda reaccionar a errores concretos
export const AUTH_ERROR = {
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  CAPTCHA_FAILED: "CAPTCHA_FAILED",
} as const;

export class AppError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

// BACKEND: formato de error esperado en las respuestas 4xx: { "code": "...", "message": "texto para el usuario" }
export function getErrorMessage(error: unknown, fallback = DEFAULT_MESSAGE): string {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message;
    return typeof message === "string" ? message : fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof AppError) return error.code;
  if (isAxiosError(error)) {
    const code = (error.response?.data as { code?: unknown } | undefined)?.code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}