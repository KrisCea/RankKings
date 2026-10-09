import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { BadgeCheck, Mail, ShieldAlert } from "lucide-react";
import DevVerificationLink from "../../features/auth/components/DevVerificationLink";
import ResendVerification from "../../features/auth/components/ResendVerification";
import { useVerifyEmail } from "../../features/auth/hooks/useVerifyEmail";
import { getErrorMessage } from "../../lib/errors";

interface VerifyEmailState {
  email?: string;
  devVerificationUrl?: string;
  from?: string;
}

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const state = useLocation().state as VerifyEmailState | null;

  const [devUrl, setDevUrl] = useState<string | undefined>(state?.devVerificationUrl);

  const verification = useVerifyEmail();
  const verifyToken = verification.mutate;
  const startedRef = useRef(false);

  // El token es de un solo uso: se envía una única vez (el modo estricto de React ejecuta los
  // efectos dos veces en desarrollo)
  useEffect(() => {
    if (!token || startedRef.current) return;
    startedRef.current = true;
    verifyToken(token);
  }, [token, verifyToken]);

  const shell = "mx-auto flex w-full max-w-sm flex-col gap-4 py-8 text-center";

  if (token && !verification.isSuccess && !verification.isError) {
    return (
      <div className={shell}>
        <p className="text-sm text-foreground/60">Verificando tu correo...</p>
      </div>
    );
  }

  if (token && verification.isSuccess) {
    return (
      <div className={shell}>
        <BadgeCheck size={40} className="mx-auto text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Correo verificado</h1>
        <p className="text-sm text-foreground/60">Tu cuenta está lista. Ya puedes iniciar sesión.</p>
        <Link
          to="/login"
          state={{ from: state?.from }}
          className="rounded-full bg-primary py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (token && verification.isError) {
    return (
      <div className={shell}>
        <ShieldAlert size={40} className="mx-auto text-red-500" />
        <h1 className="text-2xl font-bold text-foreground">No pudimos verificar tu correo</h1>
        <p className="text-sm text-foreground/60">{getErrorMessage(verification.error)}</p>
        <DevVerificationLink url={devUrl} />
        <ResendVerification onResent={setDevUrl} />
      </div>
    );
  }

  // Sin token: la persona acaba de registrarse (o viene del login) y debe revisar su correo
  return (
    <div className={shell}>
      <Mail size={40} className="mx-auto text-primary" />
      <h1 className="text-2xl font-bold text-foreground">Revisa tu correo</h1>
      <p className="text-sm text-foreground/60">
        {state?.email ? (
          <>
            Te enviamos un enlace de verificación a{" "}
            <strong className="text-foreground">{state.email}</strong>.
          </>
        ) : (
          "Usa el enlace de verificación que te enviamos."
        )}{" "}
        Revisa también la carpeta de spam.
      </p>
      <DevVerificationLink url={devUrl} />
      <ResendVerification defaultEmail={state?.email} onResent={setDevUrl} />
      <Link to="/login" className="text-sm text-primary hover:underline">
        Volver a iniciar sesión
      </Link>
    </div>
  );
}