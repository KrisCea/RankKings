import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "../../features/users/hooks/useCurrentUser";
import {
  addExternalMedia,
  addReview,
  createPost,
  getItemPost,
  uploadPostImage,
} from "../../features/posts/api";
import type { PostKind } from "../../types/post";
import { getErrorMessage } from "../../lib/errors";

const MAX_FILES = 4;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 20 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface CreatePostLocationState {
  itemId?: string;
  kind?: PostKind;
}

export default function CreatePost() {
  const location = useLocation();
  const initialState = location.state as CreatePostLocationState | null;
  const [itemId, setItemId] = useState(initialState?.itemId ?? "");
  const [kind, setKind] = useState<PostKind>(initialState?.kind ?? "item");
  const [caption, setCaption] = useState("");
  const [score, setScore] = useState(8);
  const [files, setFiles] = useState<File[]>([]);
  const [externalUrl, setExternalUrl] = useState("");
  const [externalType, setExternalType] = useState<"video" | "external">("video");
  const [createdPost, setCreatedPost] = useState<Awaited<ReturnType<typeof createPost>> | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Set<number>>(new Set());
  const [externalAdded, setExternalAdded] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { data: user, isLoading } = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: createPost,
    onSuccess: async (post) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["posts"] }),
        queryClient.invalidateQueries({ queryKey: ["featuredPosts"] }),
        queryClient.invalidateQueries({ queryKey: ["itemPost", post.rankableItem.id] }),
      ]);
      if (files.length > 0 || externalUrl.trim()) {
        setCreatedPost(post);
        return;
      }
      navigate(`/item/${post.rankableItem.id}`);
    },
  });

  const review = useMutation({
    mutationFn: async (input: { itemId: string; text: string; authorScore: number }) => {
      const itemPost = await getItemPost(input.itemId);
      await addReview(itemPost.id, { text: input.text, authorScore: input.authorScore });
      return input.itemId;
    },
    onSuccess: async (reviewedItemId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["itemReviews", reviewedItemId] }),
        queryClient.invalidateQueries({ queryKey: ["userPosts"] }),
        queryClient.invalidateQueries({ queryKey: ["item", reviewedItemId] }),
        queryClient.invalidateQueries({ queryKey: ["itemPost", reviewedItemId] }),
      ]);
      navigate(`/item/${reviewedItemId}`);
    },
  });

  const upload = useMutation({
    mutationFn: async () => {
      if (!createdPost) throw new Error("Primero crea la publicación.");
      for (const [index, file] of files.entries()) {
        if (uploadedFiles.has(index)) continue;
        await uploadPostImage(createdPost.id, file);
        setUploadedFiles((previous) => new Set(previous).add(index));
      }
      if (externalUrl.trim() && !externalAdded) {
        await addExternalMedia(createdPost.id, {
          url: externalUrl.trim(),
          type: externalType,
        });
        setExternalAdded(true);
      }
      return createdPost;
    },
    onSuccess: async (post) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["posts"] }),
        queryClient.invalidateQueries({ queryKey: ["featuredPosts"] }),
        queryClient.invalidateQueries({ queryKey: ["itemPost", post.rankableItem.id] }),
        queryClient.invalidateQueries({ queryKey: ["post", post.id] }),
      ]);
      navigate(`/item/${post.rankableItem.id}`);
    },
  });

  function validateMedia(): string | null {
    if (files.length + (externalUrl.trim() ? 1 : 0) > MAX_FILES) {
      return "Puedes adjuntar hasta cuatro imágenes y enlaces en total.";
    }
    if (files.some((file) => !IMAGE_TYPES.has(file.type))) {
      return "Usa imágenes JPEG, PNG o WebP.";
    }
    if (files.some((file) => file.size > MAX_FILE_SIZE)) {
      return "Cada imagen debe pesar 10 MiB o menos.";
    }
    if (files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_SIZE) {
      return "Las imágenes no pueden superar 20 MiB en total.";
    }
    if (externalUrl.trim()) {
      try {
        if (new URL(externalUrl.trim()).protocol !== "https:") {
          return "Los videos y enlaces externos deben usar HTTPS.";
        }
      } catch {
        return "Ingresa una URL válida.";
      }
    }
    return null;
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidationError(null);
    if (createdPost) {
      const error = validateMedia();
      if (error) {
        setValidationError(error);
        return;
      }
      if (files.every((_, index) => uploadedFiles.has(index)) && (!externalUrl.trim() || externalAdded)) {
        navigate(`/item/${createdPost.rankableItem.id}`);
        return;
      }
      upload.mutate();
      return;
    }
    if (!itemId.trim() || !caption.trim()) return;

    if (kind === "review") {
      review.mutate({ itemId: itemId.trim(), text: caption.trim(), authorScore: score });
      return;
    }

    const error = validateMedia();
    if (error) {
      setValidationError(error);
      return;
    }
    create.mutate({ itemId: itemId.trim(), kind: "item", caption: caption.trim() });
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

  const isPending = create.isPending || review.isPending || upload.isPending;
  const requestError = createdPost ? upload.error : kind === "review" ? review.error : create.error;

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">
        {createdPost ? "Añadir contenido multimedia" : "Nueva publicación"}
      </h1>
      <p className="mb-4 text-sm text-foreground/60">
        Las publicaciones se asocian a una obra existente. Prueba con el ID <code>item-1</code>.
      </p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <fieldset disabled={isPending} className="contents">
          {createdPost ? (
            <>
              <p className="rounded-lg bg-surface p-3 text-sm text-foreground/70">
                Se creó la publicación de <strong>{createdPost.rankableItem.title}</strong>.
                Ahora puedes completar la carga de las imágenes y enlaces seleccionados.
              </p>
              <p className="text-sm text-foreground/60">
                Imágenes seleccionadas: {files.length} · Enlace externo: {externalUrl.trim() ? "sí" : "no"}
              </p>
              {files.length > 0 && (
                <ul className="list-inside list-disc text-xs text-foreground/60">
                  {files.map((file, index) => (
                    <li key={`${file.name}-${index}`}>{file.name}</li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
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
                  onChange={(e) => setKind(e.target.value as PostKind)}
                  className="rounded border border-foreground/20 bg-background p-2"
                >
                  <option value="item">Publicación de obra</option>
                  <option value="review">Reseña</option>
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
              {kind === "item" && (
              <>
                <label className="flex flex-col gap-1">
                  Imágenes (JPEG, PNG o WebP; hasta 4 y 10 MiB cada una)
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                    className="rounded border border-foreground/20 bg-background p-2 text-sm"
                  />
                </label>
                <div className="flex flex-col gap-2">
                  <label htmlFor="external-media-url">Video o enlace externo (HTTPS)</label>
                  <input
                    id="external-media-url"
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://..."
                    className="rounded border border-foreground/20 bg-background p-2"
                  />
                  <select
                    aria-label="Tipo de enlace"
                    value={externalType}
                    onChange={(e) => setExternalType(e.target.value as "video" | "external")}
                    className="rounded border border-foreground/20 bg-background p-2"
                  >
                    <option value="video">Video</option>
                    <option value="external">Enlace externo</option>
                  </select>
                </div>
              </>
              )}
            </>
          )}
        </fieldset>

        {validationError && <p role="alert" className="text-red-500">{validationError}</p>}
        {requestError && <p role="alert" className="text-red-500">{getErrorMessage(requestError)}</p>}
        <button
          disabled={isPending}
          type="submit"
          className="rounded-full bg-primary px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {isPending
            ? "Procesando…"
            : createdPost
              ? "Subir contenido y publicar"
              : kind === "review"
                ? "Publicar reseña"
                : "Crear publicación"}
        </button>
        {createdPost && (
          <Link className="text-center text-sm text-foreground/60 hover:text-primary" to={`/item/${createdPost.rankableItem.id}`}>
            Continuar sin adjuntar los medios
          </Link>
        )}
      </form>
    </main>
  );
}
