// Clave pública (site key) de Cloudflare Turnstile. La clave secreta vive SOLO en el backend.
export const IS_LOCAL_API =
  import.meta.env.DEV &&
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/.test(import.meta.env.VITE_API_URL ?? "");

export const IS_LOCAL_CAPTCHA_BYPASS =
  IS_LOCAL_API && import.meta.env.VITE_DEV_CAPTCHA_BYPASS !== "false";

export const IS_LOCAL_VERIFICATION_LOGGING =
  IS_LOCAL_API && import.meta.env.VITE_DEV_VERIFICATION_LOGGING !== "false";

export const CAPTCHA_SITE_KEY =
  (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) || undefined;