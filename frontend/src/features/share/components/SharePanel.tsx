import { useEffect, useState } from "react";
import { Check, Link2, Search } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import UserListItem from "../../users/components/UserListItem";
import { useShareContacts } from "../../users/hooks/useShareContacts";
import { useSharePost } from "../../posts/hooks/useSharePost";

interface SharePanelProps {
  postId: string | null;
  onClose: () => void;
}

export default function SharePanel({ postId, onClose }: SharePanelProps) {
  const [query, setQuery] = useState("");
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const { data: contacts, isLoading } = useShareContacts();
  const sharePost = useSharePost();

  // Cada vez que se abre para un post, empieza limpio
  useEffect(() => {
    setQuery("");
    setSent(new Set());
    setCopied(false);
  }, [postId]);

  const normalized = query.trim().toLowerCase();
  const filtered = (contacts ?? []).filter(
    (c) =>
      c.displayName.toLowerCase().includes(normalized) ||
      c.username.toLowerCase().includes(normalized)
  );

  function handleSend(recipientId: string) {
    if (!postId) return;
    sharePost.mutate(
      { postId, recipientId },
      { onSuccess: () => setSent((prev) => new Set(prev).add(recipientId)) }
    );
  }

  async function handleCopyLink() {
    if (!postId) return;
    try {
      // TODO: la ruta /post/:id todavía no existe, se crea con la página de detalle
      await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // el portapapeles puede estar bloqueado por el navegador
    }
  }

  return (
    <Modal open={postId !== null} title="Compartir" onClose={onClose}>
      <div className="px-4 pt-3">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar personas..."
            className="w-full rounded-full border border-foreground/10 bg-surface py-2 pl-9 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {isLoading && (
          <p className="text-sm text-foreground/50 text-center py-6">Cargando...</p>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="text-sm text-foreground/50 text-center py-6">
            No se encontraron personas.
          </p>
        )}

        {filtered.map((user) => {
          const isSent = sent.has(user.id);
          const isPending =
            sharePost.isPending && sharePost.variables?.recipientId === user.id;

          return (
            <UserListItem
              key={user.id}
              user={user}
              action={
                <button
                  onClick={() => handleSend(user.id)}
                  disabled={isSent || isPending}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    isSent
                      ? "bg-surface text-foreground/50"
                      : "bg-primary text-white disabled:opacity-60"
                  }`}
                >
                  {isSent ? "Enviado" : "Enviar"}
                </button>
              }
            />
          );
        })}
      </div>

      <div className="border-t border-foreground/10 p-4">
        <button
          onClick={handleCopyLink}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-foreground/10 py-2 text-sm text-foreground hover:bg-surface"
        >
          {copied ? <Check size={16} className="text-primary" /> : <Link2 size={16} />}
          {copied ? "Enlace copiado" : "Copiar enlace"}
        </button>
      </div>
    </Modal>
  );
}