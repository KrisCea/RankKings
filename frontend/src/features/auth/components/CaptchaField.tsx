import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { CAPTCHA_SITE_KEY, MOCK_CAPTCHA_TOKEN } from "../captcha";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

interface CaptchaFieldProps {
  onChange: (token: string | null) => void;
  error?: string;
}

// Captcha de demostración: solo existe mientras se trabaja con mocks y no hay clave configurada
function MockCaptcha({ onChange }: { onChange: (token: string | null) => void }) {
  const [checked, setChecked] = useState(false);

  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-foreground/20 p-3 text-sm text-foreground/70">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
          onChange(e.target.checked ? MOCK_CAPTCHA_TOKEN : null);
        }}
      />
      No soy un robot
      <span className="text-xs text-foreground/40">(captcha de demostración)</span>
    </label>
  );
}

export default function CaptchaField({ onChange, error }: CaptchaFieldProps) {
  let widget;

  if (CAPTCHA_SITE_KEY) {
    widget = (
      <Turnstile
        siteKey={CAPTCHA_SITE_KEY}
        onSuccess={(token) => onChange(token)}
        onExpire={() => onChange(null)}
        onError={() => onChange(null)}
        options={{ theme: "auto" }}
      />
    );
  } else if (USE_MOCKS) {
    widget = <MockCaptcha onChange={onChange} />;
  } else {
    // Sin clave y sin mocks se bloquea el registro: nunca se deja pasar sin captcha
    widget = (
      <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
        El captcha no está configurado.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {widget}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}