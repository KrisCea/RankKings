import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addReview,
  addReviewExternalMedia,
  uploadReviewImage,
} from "../api";
import type { Review } from "../../../types/comment";
import { getErrorMessage } from "../../../lib/errors";

const MAX_FILES = 4;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 20 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface CreateReviewFormProps {
  itemId: string;
  postId: string;
  onCancel: () => void;
  onCreated: () => void;
}

export default function CreateReviewForm({
  itemId,
  postId,
  onCancel,
  onCreated,
}: CreateReviewFormProps) {
  const [text, setText] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [externalUrl, setExternalUrl] = useState("");
  const [externalType, setExternalType] = useState<"video" | "external">("video");
  const [createdReview, setCreatedReview] = useState<Review | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Set<number>>(new Set());
  const [externalAdded, setExternalAdded] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const filePreviews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  );

  useEffect(() => () => {
    filePreviews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [filePreviews]);

  const create = useMutation({
    mutationFn: async () => {
      const review = createdReview ?? await addReview(postId, {
        text: text.trim(),
        ...(score !== null ? { authorScore: score } : {}),
      });
      if (!createdReview) setCreatedReview(review);

      for (const [index, file] of files.entries()) {
        if (uploadedFiles.has(index)) continue;
        await uploadReviewImage(postId, review.id, file);
        setUploadedFiles((previous) => new Set(previous).add(index));
      }
      if (externalUrl.trim() && !externalAdded) {
        await addReviewExternalMedia(postId, review.id, {
          url: externalUrl.trim(),
          type: externalType,
        });
        setExternalAdded(true);
      }
      return review;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["itemReviews", itemId] }),
        queryClient.invalidateQueries({ queryKey: ["userPosts"] }),
        queryClient.invalidateQueries({ queryKey: ["itemPost", itemId] }),
      ]);
      onCreated();
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    if (createdReview) {
      create.mutate();
      return;
    }
    if (!text.trim()) {
      setValidationError("Escribe el contenido de la reseña.");
      return;
    }
    if (files.length + (externalUrl.trim() ? 1 : 0) > MAX_FILES) {
      setValidationError("Puedes adjuntar hasta cuatro imágenes y enlaces en total.");
      return;
    }
    if (files.some((file) => !IMAGE_TYPES.has(file.type))) {
      setValidationError("Usa imágenes JPEG, PNG o WebP.");
      return;
    }
    if (files.some((file) => file.size > MAX_FILE_SIZE)) {
      setValidationError("Cada imagen debe pesar 10 MiB o menos.");
      return;
    }
    if (files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_SIZE) {
      setValidationError("Las imágenes no pueden superar 20 MiB en total.");
      return;
    }
    if (externalUrl.trim()) {
      try {
        if (new URL(externalUrl.trim()).protocol !== "https:") {
          setValidationError("Los videos y enlaces externos deben usar HTTPS.");
          return;
        }
      } catch {
        setValidationError("Ingresa una URL válida.");
        return;
      }
    }
    create.mutate();
  }

  const isPending = create.isPending;

  return (
    <form onSubmit={submit} className="my-4 flex flex-col gap-3 rounded-xl border border-primary/30 bg-surface p-4">
      {createdReview ? (
        <p className="text-sm text-foreground/70">
          La reseña ya se creó. Vuelve a intentar para completar la carga del contenido multimedia.
        </p>
      ) : (
        <>
          <label className="flex flex-col gap-1">
            Tu reseña
            <textarea
              required
              maxLength={2000}
              rows={4}
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="rounded border border-foreground/20 bg-background p-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            Puntuación (1–10)
            <input
              type="number"
              value={score ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                setScore(value === "" ? null : Number(value));
              }}
              className="rounded border border-foreground/20 bg-background p-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            Imágenes (JPEG, PNG o WebP; hasta 4 y 10 MiB cada una)
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
              className="rounded border border-foreground/20 bg-background p-2 text-sm"
            />
            {filePreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {filePreviews.map(({ file, url }) => (
                  <img
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    src={url}
                    alt={`Vista previa de ${file.name}`}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
          </label>
          <div className="flex flex-col gap-2">
            <label htmlFor="review-external-media-url">Video o enlace externo (HTTPS, opcional)</label>
            <input
              id="review-external-media-url"
              type="url"
              value={externalUrl}
              onChange={(event) => setExternalUrl(event.target.value)}
              placeholder="https://..."
              className="rounded border border-foreground/20 bg-background p-2"
            />
            <select
              aria-label="Tipo de enlace de la reseña"
              value={externalType}
              onChange={(event) => setExternalType(event.target.value as "video" | "external")}
              className="rounded border border-foreground/20 bg-background p-2"
            >
              <option value="video">Video</option>
              <option value="external">Enlace externo</option>
            </select>
          </div>
        </>
      )}

      {validationError && <p role="alert" className="text-sm text-red-500">{validationError}</p>}
      {create.error && <p role="alert" className="text-sm text-red-500">{getErrorMessage(create.error)}</p>}
      <div className="flex gap-2">
        <button
          disabled={isPending}
          type="submit"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isPending ? "Publicando…" : createdReview ? "Reintentar carga" : "Publicar reseña"}
        </button>
        <button
          disabled={isPending}
          type="button"
          onClick={onCancel}
          className="rounded-full border border-foreground/20 px-4 py-2 text-sm"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
