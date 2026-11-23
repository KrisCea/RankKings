import { Turnstile } from "@marsidev/react-turnstile";
import { CAPTCHA_SITE_KEY, IS_LOCAL_CAPTCHA_BYPASS } from "../captcha";

interface CaptchaFieldProps {
  onChange: (token: string | null) => void;
  error?: string;
}

export default function CaptchaField({ onChange, error }: CaptchaFieldProps) {
  if (IS_LOCAL_CAPTCHA_BYPASS) return null;

  const widget = CAPTCHA_SITE_KEY ? (
    <Turnstile
      siteKey={CAPTCHA_SITE_KEY}
      onSuccess={(token) => onChange(token)}
      onExpire={() => onChange(null)}
      onError={() => onChange(null)}
      options={{ theme: "auto" }}
    />
  ) : (
    <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
      El captcha no está configurado.
    </p>
  );

  return (
    <div className="flex flex-col gap-1">
      {widget}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}