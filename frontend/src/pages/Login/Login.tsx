import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Navigate, useLocation } from "react-router-dom";
import TextField from "../../components/ui/TextField";
import PasswordField from "../../components/ui/PasswordField";
import AuthPageLayout from "../../features/auth/components/AuthPageLayout";
import { useLogin } from "../../features/auth/hooks/useLogin";
import { useCurrentUser } from "../../features/users/hooks/useCurrentUser";
import { AUTH_ERROR, getErrorCode, getErrorMessage } from "../../lib/errors";

// En el login no se exige la política de contraseñas: aplica al crearla, no al entrar
const schema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

type LoginForm = z.infer<typeof schema>;

export default function Login() {
  const location = useLocation();
  const routeState = location.state as { from?: string; reason?: string } | null;
  const from = routeState?.from ?? "/";
  const authRequired = routeState?.reason === "auth-required";

  const { data: currentUser, isLoading } = useCurrentUser();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) });

  const emailNotVerified =
    login.isError && getErrorCode(login.error) === AUTH_ERROR.EMAIL_NOT_VERIFIED;

  // Con sesión iniciada (incluso recién entrada) vuelve a donde estaba el usuario
  if (!isLoading && currentUser) return <Navigate to={from} replace />;

  return (
    <AuthPageLayout
      title="Iniciar sesión"
      description="Entra para votar, comentar y guardar tus ítems."
    >
      {authRequired && (
        <p
          role="status"
          className="mb-4 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary"
        >
          Inicia sesión o crea una cuenta para interactuar.
        </p>
      )}

      <form
        onSubmit={handleSubmit((values) => login.mutate(values))}
        noValidate
        className="flex flex-col gap-4"
      >
        <TextField
          label="Correo"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          label="Contraseña"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        {login.isError && (
          <div role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
            <p>{getErrorMessage(login.error)}</p>
            {emailNotVerified && (
              <Link
                to="/verify-email"
                state={{ email: getValues("email"), from }}
                className="mt-1 inline-block underline"
              >
                Reenviar correo de verificación
              </Link>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className="rounded-full bg-primary py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {login.isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-foreground/60">
        ¿No tienes cuenta?{" "}
        <Link to="/register" state={{ from }} className="text-primary hover:underline">
          Regístrate
        </Link>
      </p>
    </AuthPageLayout>
  );
}