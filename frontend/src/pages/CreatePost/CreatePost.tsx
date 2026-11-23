import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "../../features/users/hooks/useCurrentUser";
import { CATEGORY_LIST, CATEGORY_REQUIREMENTS } from "../../categories/registry";
import type { CategoryId } from "../../categories/types";
import {
  addExternalMedia,
  createPost,
  uploadPostImage,
  type NewRankableItemInput,
} from "../../features/posts/api";
import { getErrorMessage } from "../../lib/errors";

const MAX_FILES = 4;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 20 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface CreatePostLocationState {
  itemId?: string;
}

export default function CreatePost() {
  const location = useLocation();
  const initialState = location.state as CreatePostLocationState | null;
  const [itemId] = useState(initialState?.itemId ?? "");
  const [category, setCategory] = useState<CategoryId>("music");
  const [title, setTitle] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [identifiers, setIdentifiers] = useState<Record<string, string>>({});
  const [cover, setCover] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
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
  const coverPreview = useMemo(() => cover ? URL.createObjectURL(cover) : null, [cover]);
  const filePreviews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  );

  useEffect(() => () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
  }, [coverPreview]);

  useEffect(() => () => {
    filePreviews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [filePreviews]);

  const create = useMutation({
    mutationFn: async (input: {
      itemId?: string;
      newItem?: NewRankableItemInput;
      caption: string;
    }) => {
      if (input.itemId) {
        return createPost({ itemId: input.itemId, kind: "item", caption: input.caption });
      }
      if (input.newItem) {
        return createPost({
          rankableItem: input.newItem,
          kind: "item",
          caption: input.caption,
        });
      }
      throw new Error("Indica la obra a la que quieres asociar la publicación.");
    },
    onSuccess: async (post) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["posts"] }),
        queryClient.invalidateQueries({ queryKey: ["featuredPosts"] }),
        queryClient.invalidateQueries({ queryKey: ["itemPost", post.rankableItem.id] }),
      ]);
      if (cover || files.length > 0 || externalUrl.trim()) {
        setCreatedPost(post);
        return;
      }
      navigate(`/item/${post.rankableItem.id}`);
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
    if (!itemId) {
      if (!cover) return "Selecciona una portada para la obra.";
      if (!IMAGE_TYPES.has(cover.type)) return "La portada debe ser JPEG, PNG o WebP.";
      if (cover.size > MAX_FILE_SIZE) return "La portada debe pesar 10 MiB o menos.";
      for (const identifier of CATEGORY_REQUIREMENTS[category]) {
        const value = identifiers[identifier.key]?.trim();
        if (identifier.requirement === "required" && !value) {
          return `Completa el campo obligatorio ${identifier.label}.`;
        }
        if (value && identifier.pattern && !identifier.pattern.test(value)) {
          return `El valor de ${identifier.label} no tiene un formato válido.`;
        }
      }
      if (!title.trim()) return "Ingresa el título de la obra.";
      if (!creatorName.trim()) return "Ingresa el nombre del creador.";
    }
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
    if (!caption.trim()) {
      setValidationError("Escribe una descripción para la publicación.");
      return;
    }

    const error = validateMedia();
    if (error) {
      setValidationError(error);
      return;
    }
    if (itemId) {
      if (!itemId.trim()) {
        setValidationError("No se indicó la obra de esta publicación.");
        return;
      }
      create.mutate({ itemId: itemId.trim(), caption: caption.trim() });
      return;
    }
    if (!cover) {
      setValidationError("Selecciona una portada para la obra.");
      return;
    }
    setFiles((previous) =>
      previous.some((file) => file === cover) ? previous : [cover, ...previous]
    );
    const categoryIdentifiers = Object.fromEntries(
      Object.entries(identifiers)
        .map(([key, value]) => [key, value.trim()] as const)
        .filter(([, value]) => value.length > 0)
    );
    create.mutate({
      newItem: {
        category,
        title: title.trim(),
        creatorName: creatorName.trim(),
        description: description.trim() || undefined,
        year: year ? Number(year) : undefined,
        identifiers: categoryIdentifiers,
      },
      caption: caption.trim(),
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

  const isPending = create.isPending || upload.isPending;
  const requestError = createdPost ? upload.error : create.error;

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">
        {createdPost ? "Añadir contenido multimedia" : "Nueva publicación"}
      </h1>
      <p className="mb-4 text-sm text-foreground/60">
        El enlace externo es opcional. Las obras nuevas reciben un ID automáticamente.
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
              {!itemId && (
                <>
                  <label className="flex flex-col gap-1">
                    Tipo de obra
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value as CategoryId);
                        setIdentifiers({});
                      }}
                      className="rounded border border-foreground/20 bg-background p-2"
                    >
                      {CATEGORY_LIST.map((itemCategory) => (
                        <option key={itemCategory.id} value={itemCategory.id}>
                          {itemCategory.label}
                        </option>
                      ))}
                    </select>
                  </label>
                      <label className="flex flex-col gap-1">
                        Título
                        <input
                          required
                          maxLength={200}
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="rounded border border-foreground/20 bg-background p-2"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        Creador
                        <input
                          required
                          maxLength={200}
                          value={creatorName}
                          onChange={(e) => setCreatorName(e.target.value)}
                          className="rounded border border-foreground/20 bg-background p-2"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        Año (opcional)
                        <input
                          type="number"
                          min="1"
                          max="9999"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="rounded border border-foreground/20 bg-background p-2"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        Descripción de la obra (opcional)
                        <textarea
                          maxLength={2000}
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="rounded border border-foreground/20 bg-background p-2"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        Portada (JPEG, PNG o WebP; obligatoria, máximo 10 MiB)
                        <input
                          required
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => setCover(e.target.files?.[0] ?? null)}
                          className="rounded border border-foreground/20 bg-background p-2 text-sm"
                        />
                        {coverPreview && (
                          <img
                            src={coverPreview}
                            alt="Vista previa de la portada"
                            className="mt-2 aspect-4/3 w-full rounded-lg object-cover"
                          />
                        )}
                      </label>
                      {CATEGORY_REQUIREMENTS[category].map((identifier) => (
                        <label key={identifier.key} className="flex flex-col gap-1">
                          {identifier.label}{" "}
                          {identifier.requirement === "required" ? "(obligatorio)" : "(opcional)"}
                          <input
                            required={identifier.requirement === "required"}
                            value={identifiers[identifier.key] ?? ""}
                            onChange={(e) =>
                              setIdentifiers((previous) => ({
                                ...previous,
                                [identifier.key]: e.target.value,
                              }))
                            }
                            className="rounded border border-foreground/20 bg-background p-2"
                          />
                          <span className="text-xs text-foreground/60">{identifier.description}</span>
                        </label>
                      ))}
                </>
              )}
              {!itemId && (
                <label className="flex flex-col gap-1">
                  Descripción de la publicación
                  <textarea
                    required
                    maxLength={2000}
                    rows={5}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="rounded border border-foreground/20 bg-background p-2"
                  />
                </label>
              )}
              {itemId && (
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
              )}
              <label className="flex flex-col gap-1">
                Imágenes (JPEG, PNG o WebP; hasta 4 y 10 MiB cada una)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
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
                <label htmlFor="external-media-url">Video o enlace externo (HTTPS, opcional)</label>
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
              : itemId
                ? "Crear publicación"
                : "Crear obra y publicar"}
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
