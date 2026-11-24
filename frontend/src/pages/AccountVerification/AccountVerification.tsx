import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "../../features/users/hooks/useCurrentUser";
import { requestAccountVerification } from "../../features/users/api";
import { getErrorMessage } from "../../lib/errors";

export default function AccountVerification() {
  const { data: user, isLoading } = useCurrentUser();
  const queryClient = useQueryClient();
  const [profileLink, setProfileLink] = useState("");
  const [explanation, setExplanation] = useState("");
  const request = useMutation({
    mutationFn: requestAccountVerification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  if (isLoading) {
    return <p role="status" className="p-6">Cargando estado de verificación…</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-foreground/10 bg-surface p-6 text-center">
        <p>Inicia sesión para solicitar la verificación de tu cuenta.</p>
        <Link className="mt-3 inline-block text-primary hover:underline" to="/login">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    request.mutate({ profileLink: profileLink.trim(), explanation: explanation.trim() });
  }

  return (
    <section className="mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Verificación de cuenta</h1>
        <p className="mt-1 text-sm text-foreground/60">
          La verificación del correo es independiente de esta insignia. Cuentas personales y de empresa pueden solicitarla.
        </p>
      </header>

      {user.verificationStatus === "verified" && (
        <p role="status" className="rounded-xl border border-primary/30 bg-surface p-5">
          Tu cuenta está verificada. El nuevo contenido que publiques como Rankable Item se aprobará automáticamente.
        </p>
      )}

      {user.verificationStatus === "pending" && (
        <p role="status" className="rounded-xl border border-foreground/10 bg-surface p-5">
          Tu solicitud está en revisión por el equipo de administración.
        </p>
      )}

      {(user.verificationStatus === "unverified" || user.verificationStatus === "rejected") && (
        <>
          {user.verificationStatus === "rejected" && (
            <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm">
              Tu solicitud anterior fue rechazada.
              {user.verificationReviewReason && <span> Motivo: {user.verificationReviewReason}</span>}
              {" "}Puedes enviar una nueva solicitud.
            </p>
          )}
          <form onSubmit={submit} className="flex flex-col gap-4 rounded-xl border border-foreground/10 bg-surface p-5">
            <label className="flex flex-col gap-1 text-sm">
              Enlace a tu perfil o sitio oficial
              <input
                type="url"
                required
                pattern="https://.*"
                maxLength={2048}
                value={profileLink}
                onChange={(event) => setProfileLink(event.target.value)}
                placeholder="https://ejemplo.com/perfil"
                className="rounded border border-foreground/20 bg-background px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Explica por qué debería verificarse esta cuenta
              <textarea
                required
                minLength={1}
                maxLength={1000}
                rows={5}
                value={explanation}
                onChange={(event) => setExplanation(event.target.value)}
                className="rounded border border-foreground/20 bg-background p-3"
              />
            </label>
            {request.error && (
              <p role="alert" className="text-sm text-red-500">
                {getErrorMessage(request.error, "No se pudo enviar la solicitud.")}
              </p>
            )}
            <button
              type="submit"
              disabled={request.isPending}
              className="self-start rounded-full bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {request.isPending ? "Enviando…" : "Enviar solicitud"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
