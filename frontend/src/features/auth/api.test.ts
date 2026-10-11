import { describe, expect, it, vi } from "vitest";
import { login, logout, registerUser, resendVerification, verifyEmail } from "./api";
import { MOCK_CAPTCHA_TOKEN } from "./captcha";
import { getMockSessionUserId } from "../../mocks/accounts";
import { AUTH_ERROR, getErrorCode } from "../../lib/errors";

const PASSPHRASE = "mi gato come pescado azul";

function newAccount(name: string) {
  return {
    displayName: `Test ${name}`,
    username: `test_${name}`,
    email: `${name}@test.dev`,
    password: PASSPHRASE,
    captchaToken: MOCK_CAPTCHA_TOKEN,
  };
}

function tokenFrom(url: string | undefined): string {
  return new URL(url ?? "", "http://localhost").searchParams.get("token") ?? "";
}

describe("api de autenticación (datos simulados)", () => {
  it("inicia sesión con una cuenta válida, normaliza el correo y cierra la sesión", async () => {
    await expect(login({ email: "crisc@rankkings.dev", password: "mala" })).rejects.toThrow(
      "Correo o contraseña incorrectos"
    );
    await expect(login({ email: "nadie@rankkings.dev", password: "12345678" })).rejects.toThrow(
      "Correo o contraseña incorrectos"
    );
    expect(getMockSessionUserId()).toBeNull();

    const user = await login({ email: " CRISC@rankkings.dev ", password: "12345678" });
    expect(user.username).toBe("crisc");
    expect(getMockSessionUserId()).toBe("1");

    await logout();
    expect(getMockSessionUserId()).toBeNull();
  });

  it("registra una cuenta sin iniciar sesión, la exige verificada y permite entrar tras verificarla", async () => {
    const input = newAccount("uno");

    await expect(registerUser({ ...input, captchaToken: "falso" })).rejects.toMatchObject({
      code: AUTH_ERROR.CAPTCHA_FAILED,
    });

    const result = await registerUser(input);
    expect(result.email).toBe("uno@test.dev");
    expect(result.devVerificationUrl).toMatch(/^\/verify-email\?token=/);
    expect(getMockSessionUserId()).toBeNull(); // registrarse no inicia sesión

    // Correo y usuario repetidos
    await expect(registerUser({ ...input, username: "otro_usuario" })).rejects.toThrow(
      "Ya existe una cuenta con ese correo"
    );
    await expect(registerUser({ ...input, email: "otro@test.dev" })).rejects.toThrow(
      "Ese nombre de usuario ya está en uso"
    );

    // Sin verificar no entra, y solo se avisa si la contraseña es correcta
    await expect(login({ email: input.email, password: "mala" })).rejects.toThrow(
      "Correo o contraseña incorrectos"
    );
    const blocked = await login({ email: input.email, password: PASSPHRASE }).catch(
      (error: unknown) => error
    );
    expect(getErrorCode(blocked)).toBe(AUTH_ERROR.EMAIL_NOT_VERIFIED);

    // Verifica y entra; el enlace no sirve dos veces
    await verifyEmail(tokenFrom(result.devVerificationUrl));
    const user = await login({ email: input.email, password: PASSPHRASE });
    expect(user.username).toBe("test_uno");
    await expect(verifyEmail(tokenFrom(result.devVerificationUrl))).rejects.toMatchObject({
      code: AUTH_ERROR.INVALID_TOKEN,
    });
  });

  it("rechaza enlaces inválidos o vencidos y reenvía enlaces nuevos", async () => {
    await expect(verifyEmail("no-existe")).rejects.toMatchObject({
      code: AUTH_ERROR.INVALID_TOKEN,
    });

    const first = await registerUser(newAccount("dos"));
    const second = await resendVerification("dos@test.dev");
    expect(second.devVerificationUrl).toBeDefined();
    expect(second.devVerificationUrl).not.toBe(first.devVerificationUrl);

    // El enlace anterior deja de valer cuando se pide uno nuevo
    await expect(verifyEmail(tokenFrom(first.devVerificationUrl))).rejects.toMatchObject({
      code: AUTH_ERROR.INVALID_TOKEN,
    });

    // Un enlace vencido se rechaza con su propio código
    const spy = vi.spyOn(Date, "now").mockReturnValue(Date.now() + 25 * 60 * 60 * 1000);
    await expect(verifyEmail(tokenFrom(second.devVerificationUrl))).rejects.toMatchObject({
      code: AUTH_ERROR.TOKEN_EXPIRED,
    });
    spy.mockRestore();

    // Cuentas inexistentes o ya verificadas no reciben enlace (y no se revela cuáles existen)
    expect(await resendVerification("nadie@test.dev")).toEqual({});
    expect(await resendVerification("crisc@rankkings.dev")).toEqual({});
  });
});