import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

// Solo ayuda de interfaz. BACKEND: debe aplicar sus propias reglas y comprobar contra una lista
// grande de contraseñas comunes y filtradas (p. ej. Pwned Passwords, que se consulta sin enviar la
// contraseña completa). Con bcrypt, solo cuentan los primeros 72 bytes; Argon2 no tiene ese límite.
const BANNED_FRAGMENTS = ["password", "contraseña", "contrasena", "qwerty", "123456", "rankkings"];

function isSequential(value: string): boolean {
  if (value.length < 2) return false;
  const step = value.charCodeAt(1) - value.charCodeAt(0);
  if (Math.abs(step) !== 1) return false;

  for (let i = 1; i < value.length; i++) {
    if (value.charCodeAt(i) - value.charCodeAt(i - 1) !== step) return false;
  }
  return true;
}

export function isPredictable(password: string): boolean {
  const value = password.toLowerCase();

  if (/^(.{1,4})\1+$/.test(value)) return true; // un bloque corto repetido (aaaa..., abcabcabc...)
  if (isSequential(value)) return true; // abcdefghijkl, 987654321...
  return BANNED_FRAGMENTS.some((fragment) => value.includes(fragment));
}

// Evita contraseñas que contienen el usuario o el correo (se ignoran partes de menos de 4 caracteres)
export function containsPersonalInfo(password: string, parts: string[]): boolean {
  const value = password.toLowerCase();
  return parts.some((part) => {
    const needle = part.trim().toLowerCase();
    return needle.length >= 4 && value.includes(needle);
  });
}

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`)
  .max(PASSWORD_MAX_LENGTH, `Máximo ${PASSWORD_MAX_LENGTH} caracteres`)
  .refine((value) => !isPredictable(value), {
    message: "Es demasiado predecible. Prueba con una frase larga de palabras sin relación",
  });

export type StrengthScore = 0 | 1 | 2 | 3 | 4;

export const STRENGTH_LABELS = ["Muy débil", "Débil", "Aceptable", "Buena", "Excelente"] as const;

// Estimación sencilla basada en largo y variedad. Para algo más fino, la librería zxcvbn-ts.
export function estimateStrength(password: string, personal: string[] = []): StrengthScore {
  if (password.length < PASSWORD_MIN_LENGTH) return 0;
  if (isPredictable(password) || containsPersonalInfo(password, personal)) return 1;

  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;

  let score = password.length >= 20 ? 3 : password.length >= 16 ? 2 : 1;
  if (classes >= 3) score += 1;

  return Math.min(score, 4) as StrengthScore;
}