import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { useComments } from "../hooks/useComments";
import { useAddComment } from "../hooks/useAddComment";
import { useToggleCommentLike } from "../hooks/useToggleCommentLike";
import { useCurrentUser } from "../../users/hooks/useCurrentUser";
import { useRequireAuth } from "../../auth/hooks/useRequireAuth";
import CommentList from "./CommentList";
import CommentInput from "./CommentInput";
import type { Comment } from "../../../types/comment";

interface CommentsPanelProps {
  postId: string | null;
  onClose: () => void;
}

interface ReplyTarget {
  parentId: string; // comentario principal del hilo
  username: string; // a quién se responde
}

export default function CommentsPanel({ postId, onClose }: CommentsPanelProps) {
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const location = useLocation();

  const { data: user, isLoading: userLoading } = useCurrentUser();
  const requireAuth = useRequireAuth();

  const { data: comments, isLoading } = useComments(postId);
  const addComment = useAddComment(postId ?? "");
  const toggleLike = useToggleCommentLike(postId ?? "");

  // Cierra con la tecla Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Al abrir otro post, descarta cualquier respuesta a medias
  useEffect(() => {
    setReplyTarget(null);
  }, [postId]);

  const handleReply = requireAuth((comment: Comment) => {
    setReplyTarget({
      parentId: comment.parentId ?? comment.id,
      username: comment.author.username,
    });
  });

  function handleSubmit(text: string) {
    addComment.mutate(
      {
        text,
        parentId: replyTarget?.parentId,
        replyToUsername: replyTarget?.username,
      },
      { onSuccess: () => setReplyTarget(null) }
    );
  }

  if (postId === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full md:max-w-xl h-[85vh] md:h-180 max-h-[90vh] bg-background rounded-t-2xl md:rounded-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-foreground/10 p-4">
          <h2 className="font-semibold text-foreground">Comentarios</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-1.5 hover:bg-surface text-foreground/70"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <CommentList
            comments={comments ?? []}
            isLoading={isLoading}
            onToggleLike={requireAuth((id: string) => toggleLike.mutate(id))}
            onReply={handleReply}
          />
        </div>

        <div className="px-4 pb-4">
          {user ? (
            <CommentInput
              onSubmit={handleSubmit}
              isSubmitting={addComment.isPending}
              replyingTo={replyTarget?.username}
              onCancelReply={() => setReplyTarget(null)}
            />
          ) : (
            !userLoading && (
              <p className="mt-2 border-t border-foreground/10 pt-3 text-center text-sm text-foreground/60">
                <Link
                  to="/login"
                  state={{
                    from: location.pathname + location.search,
                    reason: "auth-required",
                  }}
                  className="text-primary hover:underline"
                >
                  Inicia sesión
                </Link>{" "}
                para comentar.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}