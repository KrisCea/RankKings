import { useEffect, useState } from "react";
import TextField from "../../../components/ui/TextField";
import { useResendVerification } from "../hooks/useResendVerification";
import { getErrorMessage } from "../../../lib/errors";

const COOLDOWN_SECONDS = 60;

interface ResendVerificationProps {
  defaultEmail?: string;
  onResent?: (devVerificationUrl?: string) => void;
}

export default function ResendVerification({ defaultEmail, onResent }: ResendVerificationProps) {
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [cooldown, setCooldown] = useState(0);
  const [sent, setSent] = useState(false);
  const resend = useResendVerification();

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const validEmail = /^\S+@\S+\.\S+$/.test(email.trim());

  function handleResend() {
    resend.mutate(email.trim(), {
      onSuccess: (result) => {
        setSent(true);
        setCooldown(COOLDOWN_SECONDS);
        onResent?.(result.devVerificationUrl);
      },
    });
  }

  return (
    <div className="flex flex-col gap-3 text-left">
      {!defaultEmail && (
        <TextField
          label="Correo de tu cuenta"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      )}

      {sent && (
        <p role="status" className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
          Si hay una cuenta pendiente con ese correo, te enviamos un enlace nuevo.
        </p>
      )}

      {resend.isError && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {getErrorMessage(resend.error)}
        </p>
      )}

      <button
        type="button"
        onClick={handleResend}
        disabled={!validEmail || cooldown > 0 || resend.isPending}
        className="rounded-full border border-foreground/10 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
      >
        {resend.isPending
          ? "Enviando..."
          : cooldown > 0
            ? `Reenviar en ${cooldown} s`
            : "Reenviar correo de verificación"}
      </button>
    </div>
  );
}