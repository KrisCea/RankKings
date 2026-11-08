import { useEffect, useRef } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { BadgeCheck, Mail, ShieldAlert } from "lucide-react";
import AuthPageLayout from "../../features/auth/components/AuthPageLayout";
import ResendVerification from "../../features/auth/components/ResendVerification";
import { useVerifyEmail } from "../../features/auth/hooks/useVerifyEmail";
import { getErrorMessage } from "../../lib/errors";

interface VerifyEmailState {
  email?: string;
  from?: string;
}

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const state = useLocation().state as VerifyEmailState | null;

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

  if (token && !verification.isSuccess && !verification.isError) {
    return (
      <AuthPageLayout title="Verificando correo">
        <p role="status" className="text-sm text-foreground/60">
          Verificando tu correo...
        </p>
      </AuthPageLayout>
    );
  }

  if (token && verification.isSuccess) {
    return (
      <AuthPageLayout
        title="Correo verificado"
        description="Tu cuenta está lista. Ya puedes iniciar sesión."
        icon={<BadgeCheck size={40} className="text-primary" />}
      >
        <Link
          to="/login"
          state={{ from: state?.from }}
          className="block rounded-full bg-primary py-2.5 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Iniciar sesión
        </Link>
      </AuthPageLayout>
    );
  }

  if (token && verification.isError) {
    return (
      <AuthPageLayout
        title="No pudimos verificar tu correo"
        description={getErrorMessage(verification.error)}
        icon={<ShieldAlert size={40} className="text-red-500" />}
      >
        <ResendVerification />
      </AuthPageLayout>
    );
  }

  // Sin token: la persona acaba de registrarse (o viene del login) y debe revisar su correo
  return (
    <AuthPageLayout
      title="Revisa tu correo"
      icon={<Mail size={40} className="text-primary" />}
      description={
        <>
          {state?.email ? (
            <>
              Te enviamos un enlace de verificación a{" "}
              <strong className="text-foreground">{state.email}</strong>.
            </>
          ) : (
            "Usa el enlace de verificación que te enviamos."
          )}{" "}
          Revisa también la carpeta de spam.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ResendVerification defaultEmail={state?.email} />
        <Link to="/login" className="text-center text-sm text-primary hover:underline">
          Volver a iniciar sesión
        </Link>
      </div>
    </AuthPageLayout>
  );
}