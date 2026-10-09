// Clave pública (site key) de Cloudflare Turnstile. La clave secreta vive SOLO en el backend.
export const CAPTCHA_SITE_KEY =
  (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) || undefined;

// Token del captcha de demostración (casilla). Solo lo acepta el mock.
export const MOCK_CAPTCHA_TOKEN = "mock-captcha-token";