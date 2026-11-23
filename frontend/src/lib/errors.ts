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
    const responseData = error.response?.data as
      | { message?: unknown; error?: unknown }
      | undefined;
    const message = typeof responseData?.message === "string"
      ? responseData.message
      : typeof responseData?.error === "string"
        ? responseData.error
        : undefined;
    if (message) return message;
    if (error.response?.status === 405) return "El servidor no tiene habilitada la ruta para publicar esta obra.";
    if (error.response?.status === 401) return "Tu sesión no es válida o ha expirado.";
    if (error.response?.status === 413) return "El archivo supera el tamaño permitido.";
    if (error.code === "ERR_NETWORK") return "No se pudo conectar con el servidor.";
    return fallback;
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