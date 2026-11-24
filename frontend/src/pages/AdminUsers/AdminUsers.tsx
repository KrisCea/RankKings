import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "../../features/users/hooks/useCurrentUser";
import {
  approveAccountVerification,
  getPendingVerificationRequests,
  promoteUserToAdmin,
  rejectAccountVerification,
} from "../../features/users/api";
import { getErrorMessage } from "../../lib/errors";

export default function AdminUsers() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const queryClient = useQueryClient();
  const promotion = useMutation({ mutationFn: promoteUserToAdmin });
  const verificationRequests = useQuery({
    queryKey: ["adminVerificationRequests"],
    queryFn: getPendingVerificationRequests,
    enabled: user?.role === "admin",
  });
  const verificationDecision = useMutation({
    mutationFn: async (input: { userId: string; action: "approve" | "reject"; reason?: string }) =>
      input.action === "approve"
        ? approveAccountVerification(input.userId)
        : rejectAccountVerification(input.userId, input.reason ?? ""),
    onSuccess: async () => {
      setRejectingId(null);
      setRejectionReason("");
      await queryClient.invalidateQueries({ queryKey: ["adminVerificationRequests"] });
    },
  });

  if (userLoading) {
    return <p role="status" className="p-6">Comprobando permisos…</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-foreground/10 bg-surface p-6 text-center">
        <p>Inicia sesión con una cuenta administradora para gestionar administradores.</p>
        <Link className="mt-3 inline-block text-primary hover:underline" to="/login">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <p role="alert" className="mx-auto max-w-2xl py-12 text-center text-foreground/60">
        No tienes permisos para gestionar administradores.
      </p>
    );
  }

  function submitPromotion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    promotion.mutate(email.trim(), {
      onSuccess: (result) => {
        setMessage(
          result.changed
            ? `@${result.username} ahora es administrador.`
            : `@${result.username} ya tenía rol de administrador.`
        );
        setEmail("");
      },
    });
  }

  function submitRejection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rejectingId || !rejectionReason.trim()) return;
    verificationDecision.mutate({
      userId: rejectingId,
      action: "reject",
      reason: rejectionReason.trim(),
    });
  }

  return (
    <section className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Gestión de usuarios</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Revisa solicitudes de verificación y administra quién puede moderar Rankable Items.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Solicitudes de verificación</h2>
        {verificationRequests.isLoading && (
          <p role="status" className="py-4 text-sm text-foreground/60">Cargando solicitudes…</p>
        )}
        {verificationRequests.error && (
          <p role="alert" className="rounded-xl border border-red-500/30 p-4 text-sm text-red-500">
            {getErrorMessage(verificationRequests.error, "No se pudieron cargar las solicitudes.")}
          </p>
        )}
        {verificationDecision.error && (
          <p role="alert" className="mb-3 rounded-xl border border-red-500/30 p-4 text-sm text-red-500">
            {getErrorMessage(verificationDecision.error, "No se pudo revisar la solicitud.")}
          </p>
        )}
        {!verificationRequests.isLoading && !verificationRequests.error
          && verificationRequests.data?.length === 0 && (
            <p className="rounded-xl border border-foreground/10 bg-surface p-5 text-sm text-foreground/60">
              No hay solicitudes pendientes.
            </p>
          )}
        <div className="flex flex-col gap-3">
          {verificationRequests.data?.map((request) => (
            <article key={request.id} className="rounded-xl border border-foreground/10 bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{request.displayName} (@{request.username})</h3>
                  <p className="text-sm text-foreground/60">
                    Cuenta {request.accountType === "business" ? "de empresa" : "personal"} ·{" "}
                    {new Date(request.requestedAt).toLocaleString()}
                  </p>
                </div>
                <a
                  href={request.profileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Revisar enlace
                </a>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm">{request.explanation}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={verificationDecision.isPending}
                  onClick={() => verificationDecision.mutate({ userId: request.id, action: "approve" })}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Aprobar verificación
                </button>
                {rejectingId !== request.id && (
                  <button
                    type="button"
                    disabled={verificationDecision.isPending}
                    onClick={() => {
                      setRejectingId(request.id);
                      setRejectionReason("");
                    }}
                    className="rounded-full border border-red-500/40 px-4 py-2 text-sm text-red-500 disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                )}
              </div>
              {rejectingId === request.id && (
                <form onSubmit={submitRejection} className="mt-3 flex flex-col gap-2">
                  <label className="flex flex-col gap-1 text-sm">
                    Motivo del rechazo
                    <textarea
                      required
                      maxLength={1000}
                      rows={3}
                      value={rejectionReason}
                      onChange={(event) => setRejectionReason(event.target.value)}
                      className="rounded border border-foreground/20 bg-background p-2"
                    />
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={verificationDecision.isPending || !rejectionReason.trim()}
                      className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      Confirmar rechazo
                    </button>
                    <button
                      type="button"
                      disabled={verificationDecision.isPending}
                      onClick={() => setRejectingId(null)}
                      className="rounded-full border border-foreground/20 px-4 py-2 text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </article>
          ))}
        </div>
      </section>

      <h2 className="mb-3 text-lg font-semibold">Administradores</h2>
      <form
        onSubmit={submitPromotion}
        className="flex flex-col gap-3 rounded-xl border border-foreground/10 bg-surface p-5"
      >
        <label htmlFor="admin-email" className="text-sm font-medium">
          Correo de la cuenta
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded border border-foreground/20 bg-background px-3 py-2"
        />
        <button
          type="submit"
          disabled={promotion.isPending}
          className="self-start rounded-full bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {promotion.isPending ? "Asignando…" : "Hacer administrador"}
        </button>
        {promotion.error && (
          <p role="alert" className="text-sm text-red-500">
            {getErrorMessage(promotion.error, "No se pudo asignar el rol de administrador.")}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm text-green-700">
            {message}
          </p>
        )}
      </form>

      <Link to="/admin/moderation" className="mt-4 inline-block text-sm text-primary hover:underline">
        Revisar Rankable Items y contenido pendiente
      </Link>
    </section>
  );
}
