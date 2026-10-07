import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Navigate, useLocation } from "react-router-dom";
import TextField from "../../components/ui/TextField";
import { useRegister } from "../../features/auth/hooks/useRegister";
import { useCurrentUser } from "../../features/users/hooks/useCurrentUser";
import { getErrorMessage } from "../../lib/errors";

const schema = z
  .object({
    displayName: z.string().trim().min(2, "Mínimo 2 caracteres").max(40, "Máximo 40 caracteres"),
    username: z
      .string()
      .regex(/^[a-zA-Z0-9_]{3,20}$/, "De 3 a 20 caracteres: letras, números y guion bajo"),
    email: z.string().email("Ingresa un correo válido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof schema>;

export default function Register() {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const { data: currentUser, isLoading } = useCurrentUser();
  const registerUser = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(schema) });

  if (!isLoading && currentUser) return <Navigate to={from} replace />;

  function onSubmit(values: RegisterForm) {
    registerUser.mutate({
      displayName: values.displayName,
      username: values.username,
      email: values.email,
      password: values.password,
    });
  }

  return (
    <div className="mx-auto w-full max-w-sm py-8">
      <h1 className="mb-1 text-2xl font-bold text-foreground">Crear cuenta</h1>
      <p className="mb-6 text-sm text-foreground/60">
        Únete para puntuar, reseñar y guardar lo que quieres ver o escuchar.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <TextField
          label="Nombre"
          autoComplete="name"
          error={errors.displayName?.message}
          {...register("displayName")}
        />
        <TextField
          label="Nombre de usuario"
          autoComplete="username"
          placeholder="sin espacios ni @"
          error={errors.username?.message}
          {...register("username")}
        />
        <TextField
          label="Correo"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <TextField
          label="Repite la contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {registerUser.isError && (
          <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {getErrorMessage(registerUser.error)}
          </p>
        )}

        <button
          type="submit"
          disabled={registerUser.isPending}
          className="rounded-full bg-primary py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {registerUser.isPending ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-foreground/60">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" state={{ from }} className="text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}