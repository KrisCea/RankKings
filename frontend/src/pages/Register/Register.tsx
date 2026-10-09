import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import TextField from "../../components/ui/TextField";
import PasswordField from "../../components/ui/PasswordField";
import CaptchaField from "../../features/auth/components/CaptchaField";
import PasswordStrengthMeter from "../../features/auth/components/PasswordStrengthMeter";
import { containsPersonalInfo, passwordSchema } from "../../features/auth/password";
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
    password: passwordSchema,
    confirmPassword: z.string(),
    captchaToken: z.string().min(1, "Confirma que no eres un robot"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  .refine((data) => !containsPersonalInfo(data.password, [data.username, data.email.split("@")[0]]), {
    message: "No uses tu usuario ni tu correo dentro de la contraseña",
    path: ["password"],
  });

type RegisterForm = z.infer<typeof schema>;

export default function Register() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  // El token del captcha es de un solo uso: al fallar el registro se vuelve a montar el widget
  const [captchaKey, setCaptchaKey] = useState(0);

  const { data: currentUser, isLoading } = useCurrentUser();
  const registerUser = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: { captchaToken: "" },
  });

  const password = watch("password") ?? "";
  const personal = [watch("username") ?? "", (watch("email") ?? "").split("@")[0]];

  if (!isLoading && currentUser) return <Navigate to={from} replace />;

  function onSubmit(values: RegisterForm) {
    registerUser.mutate(
      {
        displayName: values.displayName,
        username: values.username,
        email: values.email,
        password: values.password,
        captchaToken: values.captchaToken,
      },
      {
        onSuccess: (result) =>
          navigate("/verify-email", {
            replace: true,
            state: { email: result.email, devVerificationUrl: result.devVerificationUrl, from },
          }),
        onError: () => {
          setValue("captchaToken", "");
          setCaptchaKey((key) => key + 1);
        },
      }
    );
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

        <div className="flex flex-col gap-2">
          <PasswordField
            label="Contraseña"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrengthMeter password={password} personal={personal} />
        </div>

        <PasswordField
          label="Repite la contraseña"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <CaptchaField
          key={captchaKey}
          onChange={(token) => setValue("captchaToken", token ?? "", { shouldValidate: true })}
          error={errors.captchaToken?.message}
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