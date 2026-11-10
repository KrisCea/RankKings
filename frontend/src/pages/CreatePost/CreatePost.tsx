import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "../../features/users/hooks/useCurrentUser";
import { createPost, type NewPostInput } from "../../features/posts/api";
import { getErrorMessage } from "../../lib/errors";

export default function CreatePost() {
  const [itemId, setItemId] = useState("");
  const [kind, setKind] = useState<NewPostInput["kind"]>("review");
  const [caption, setCaption] = useState("");
  const [score, setScore] = useState(8);
  const { data: user, isLoading } = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: createPost,
    onSuccess: async (post) => {
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate(post.kind === "review" ? `/post/${post.id}` : `/item/${post.rankableItem.id}`);
    },
  });

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!itemId.trim() || !caption.trim()) return;
    create.mutate({
      itemId: itemId.trim(),
      kind,
      caption: caption.trim(),
      ...(kind === "review" ? { authorScore: score } : {}),
    });
  }

  if (isLoading) return <p role="status" className="p-6">Comprobando sesión…</p>;
  if (!user) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <p>Debes iniciar sesión para publicar.</p>
        <Link className="text-primary" to="/login" state={{ from: "/create-post" }}>
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Nueva publicación</h1>
      <p className="mb-4 text-sm text-foreground/60">
        Por ahora puedes publicar obras ya existentes. Prueba con el ID <code>item-1</code> del catálogo local.
      </p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          ID de obra
          <input
            required
            maxLength={100}
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            placeholder="item-1"
            className="rounded border border-foreground/20 bg-background p-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          Tipo
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as NewPostInput["kind"])}
            className="rounded border border-foreground/20 bg-background p-2"
          >
            <option value="review">Reseña</option>
            <option value="item">Publicación de obra</option>
          </select>
        </label>
        {kind === "review" && (
          <label className="flex flex-col gap-1">
            Nota (1–10)
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="rounded border border-foreground/20 bg-background p-2"
            />
          </label>
        )}
        <label className="flex flex-col gap-1">
          Descripción
          <textarea
            required
            maxLength={2000}
            rows={5}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="rounded border border-foreground/20 bg-background p-2"
          />
        </label>
        {create.isError && <p role="alert" className="text-red-500">{getErrorMessage(create.error)}</p>}
        <button
          disabled={create.isPending}
          type="submit"
          className="rounded-full bg-primary px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {create.isPending ? "Publicando…" : "Publicar"}
        </button>
      </form>
    </main>
  );
}
