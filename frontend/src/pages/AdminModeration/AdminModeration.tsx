import { useState } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import DeleteContentButton from "../../components/ui/DeleteContentButton";
import { deleteComment } from "../../features/comments/api";
import { deletePost, deleteReview } from "../../features/posts/api";
import { useCurrentUser } from "../../features/users/hooks/useCurrentUser";
import {
  approveModerationItem,
  getModerationQueue,
  rejectModerationItem,
  type ModerationContentType,
  type ModerationQueueItem,
  type ModerationStatus,
  type ModerationTypeFilter,
} from "../../features/moderation/api";
import { getErrorMessage } from "../../lib/errors";

const PAGE_SIZE = 25;

function contentDescription(item: ModerationQueueItem) {
  switch (item.type) {
    case "item":
      return item.content.description || `Categoría: ${item.content.category}`;
    case "post":
      return item.content.caption;
    case "review":
    case "comment":
      return item.content.text;
    case "media":
      return item.content.url;
  }
}

function contextLink(item: ModerationQueueItem): string | null {
  switch (item.type) {
    case "item":
      return `/item/${item.id}`;
    case "post":
      return `/item/${item.content.item.id}`;
    case "review":
      return `/item/${item.content.itemId}`;
    case "comment":
    case "media":
      return `/post/${item.content.postId}`;
  }
}

function titleFor(item: ModerationQueueItem): string {
  switch (item.type) {
    case "item":
      return item.content.title;
    case "post":
      return item.content.item.title;
    case "review":
      return `Reseña · puntuación ${item.content.authorScore ?? "sin puntuación"}`;
    case "comment":
      return item.content.parentId ? "Respuesta a un comentario" : "Comentario";
    case "media":
      return item.content.isCover ? "Portada" : `Adjunto · ${item.content.mediaType}`;
  }
}

function getDecisionErrorMessage(error: unknown): string {
  if (isAxiosError(error) && error.response?.status === 409) {
    return "Este contenido ya fue moderado. Actualiza la cola e inténtalo de nuevo.";
  }
  return getErrorMessage(error);
}

export default function AdminModeration() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ModerationStatus>("pending");
  const [type, setType] = useState<ModerationTypeFilter>("all");
  const [rejecting, setRejecting] = useState<{ type: ModerationContentType; id: string } | null>(null);
  const [reason, setReason] = useState("");

  const queryKey = ["adminModeration", status, type] as const;
  const queue = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      getModerationQueue({
        status,
        type,
        limit: PAGE_SIZE,
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page.hasMore && lastPage.page.nextCursor
        ? lastPage.page.nextCursor
        : undefined,
    enabled: user?.role === "admin",
  });

  const decision = useMutation({
    mutationFn: async (input: {
      action: "approve" | "reject";
      type: ModerationContentType;
      id: string;
      reason?: string;
    }) =>
      input.action === "approve"
        ? approveModerationItem(input.type, input.id)
        : rejectModerationItem(input.type, input.id, input.reason ?? ""),
    onSuccess: async () => {
      setRejecting(null);
      setReason("");
      await queryClient.invalidateQueries({ queryKey: ["adminModeration"] });
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey: ["adminModeration"] });
    },
  });

  if (userLoading) {
    return <p role="status" className="p-6">Comprobando permisos…</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-foreground/10 bg-surface p-6 text-center">
        <p>Inicia sesión con una cuenta administradora para abrir la cola de moderación.</p>
        <Link className="mt-3 inline-block text-primary hover:underline" to="/login">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <p role="alert" className="mx-auto max-w-2xl py-12 text-center text-foreground/60">
        No tienes permisos para acceder a esta página.
      </p>
    );
  }

  const items = queue.data?.pages.flatMap((page) => page.items) ?? [];

  function submitRejection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rejecting || !reason.trim()) return;
    decision.mutate({ action: "reject", ...rejecting, reason: reason.trim() });
  }

  return (
    <section className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Moderación</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Revisa Rankable Items y, si aún existen, registros antiguos que ya estaban pendientes.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Estado
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as ModerationStatus);
              setRejecting(null);
              setReason("");
            }}
            className="rounded border border-foreground/20 bg-background px-3 py-2"
          >
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobados</option>
            <option value="rejected">Rechazados</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Tipo de contenido
          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value as ModerationTypeFilter);
              setRejecting(null);
              setReason("");
            }}
            className="rounded border border-foreground/20 bg-background px-3 py-2"
          >
            <option value="all">Todos</option>
            <option value="item">Rankable Items</option>
            <option value="post">Publicaciones</option>
            <option value="review">Reseñas</option>
            <option value="comment">Comentarios</option>
            <option value="media">Adjuntos</option>
          </select>
        </label>
      </div>

      {queue.isLoading && (
        <p role="status" className="py-10 text-center text-foreground/60">
          Cargando cola…
        </p>
      )}
      {queue.error && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-500">
          {getErrorMessage(queue.error, "No se pudo cargar la cola de moderación.")}
        </div>
      )}
      {!queue.isLoading && !queue.error && items.length === 0 && (
        <p className="rounded-xl border border-foreground/10 bg-surface p-8 text-center text-sm text-foreground/60">
          No hay contenido para estos filtros.
        </p>
      )}

      {decision.error && (
        <p role="alert" className="mb-4 text-sm text-red-500">
          {getDecisionErrorMessage(decision.error)}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const target = { type: item.type, id: item.id };
          const isRejecting = rejecting?.type === item.type && rejecting.id === item.id;
          const link = contextLink(item);
          const deleteAction = item.type === "post"
            ? () => deletePost(item.id)
            : item.type === "review"
              ? () => deleteReview(item.content.postId, item.id)
              : item.type === "comment"
                ? () => deleteComment(item.id)
                : undefined;

          return (
            <article key={`${item.type}:${item.id}`} className="rounded-xl border border-foreground/10 bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-foreground/50">
                    {item.type} · {item.status}
                  </p>
                  <h2 className="mt-1 font-semibold">{titleFor(item)}</h2>
                  <p className="mt-1 text-sm text-foreground/70">
                    Por @{item.author.username} · {new Date(item.submittedAt).toLocaleString()}
                  </p>
                </div>
                {link && (
                  <Link to={link} className="text-sm text-primary hover:underline">
                    Ver contexto
                  </Link>
                )}
                {deleteAction && (
                  <DeleteContentButton
                    ownerId={item.author.id}
                    label="Eliminar"
                    confirmationMessage="¿Eliminar este contenido? Esta acción no se puede deshacer."
                    onDelete={deleteAction}
                    queryKeys={[
                      ["adminModeration"],
                      ["posts"],
                      ["featuredPosts"],
                      ["userPosts"],
                      ["itemPost"],
                      ["itemReviews"],
                      ["comments"],
                    ]}
                  />
                )}
              </div>

              {item.type === "post" && item.content.item.coverUrl && (
                <img
                  src={item.content.item.coverUrl}
                  alt={`Portada: ${item.content.item.title}`}
                  className="mt-3 max-h-64 max-w-full rounded-lg object-cover"
                />
              )}
              {item.type === "item" && item.content.coverUrl && (
                <img
                  src={item.content.coverUrl}
                  alt={`Portada: ${item.content.title}`}
                  className="mt-3 max-h-64 max-w-full rounded-lg object-cover"
                />
              )}
              {item.type === "media" && item.content.mediaType === "image" && (
                <img
                  src={item.content.url}
                  alt="Adjunto en revisión"
                  className="mt-3 max-h-64 max-w-full rounded-lg object-cover"
                />
              )}
              <p className="mt-3 whitespace-pre-wrap break-words text-sm text-foreground/80">
                {contentDescription(item)}
              </p>

              {status === "pending" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={decision.isPending}
                    onClick={() => decision.mutate({ action: "approve", ...target })}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    Aprobar
                  </button>
                  {!isRejecting && (
                    <button
                      type="button"
                      disabled={decision.isPending}
                      onClick={() => {
                        setRejecting(target);
                        setReason("");
                      }}
                      className="rounded-full border border-red-500/40 px-4 py-2 text-sm text-red-500 disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                  )}
                  {isRejecting && (
                    <form onSubmit={submitRejection} className="mt-2 flex w-full flex-col gap-2">
                      <label className="flex flex-col gap-1 text-sm">
                        Motivo del rechazo
                        <textarea
                          required
                          maxLength={1000}
                          rows={3}
                          value={reason}
                          onChange={(event) => setReason(event.target.value)}
                          className="rounded border border-foreground/20 bg-background p-2"
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={decision.isPending || !reason.trim()}
                          className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                          Confirmar rechazo
                        </button>
                        <button
                          type="button"
                          disabled={decision.isPending}
                          onClick={() => setRejecting(null)}
                          className="rounded-full border border-foreground/20 px-4 py-2 text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {queue.hasNextPage && (
        <button
          type="button"
          disabled={queue.isFetchingNextPage}
          onClick={() => queue.fetchNextPage()}
          className="mt-5 w-full rounded-full border border-foreground/20 px-4 py-2 text-sm hover:bg-surface disabled:opacity-50"
        >
          {queue.isFetchingNextPage ? "Cargando…" : "Cargar más"}
        </button>
      )}
    </section>
  );
}
