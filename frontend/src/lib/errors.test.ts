import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { AppError, AUTH_ERROR, getErrorCode, getErrorMessage } from "./errors";

describe("errores", () => {
  it("lee el código y el mensaje de errores propios, de la API y desconocidos", () => {
    // Error propio de la app (lo que lanzan los mocks)
    const own = new AppError(AUTH_ERROR.EMAIL_NOT_VERIFIED, "Debes verificar tu correo");
    expect(getErrorCode(own)).toBe("EMAIL_NOT_VERIFIED");
    expect(getErrorMessage(own)).toBe("Debes verificar tu correo");

    // Respuesta de error del backend: { code, message }
    const response = {
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: {},
      data: { code: "TOKEN_EXPIRED", message: "El enlace venció" },
    } as unknown as AxiosResponse;
    const fromApi = new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, response);
    expect(getErrorCode(fromApi)).toBe("TOKEN_EXPIRED");
    expect(getErrorMessage(fromApi)).toBe("El enlace venció");

    // Algo que no es un Error: sin código y con el mensaje por defecto (o el que se indique)
    expect(getErrorCode("boom")).toBeUndefined();
    expect(getErrorMessage("boom")).toBe("Ocurrió un error. Inténtalo de nuevo.");
    expect(getErrorMessage("boom", "Mensaje propio")).toBe("Mensaje propio");
  });
});