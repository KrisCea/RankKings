import { isAxiosError } from "axios";

const DEFAULT_MESSAGE = "Ocurrió un error. Inténtalo de nuevo.";

// BACKEND: formato de error esperado en las respuestas 4xx: { "message": "texto para el usuario" }
export function getErrorMessage(error: unknown, fallback = DEFAULT_MESSAGE): string {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message;
    return typeof message === "string" ? message : fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}