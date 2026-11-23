import { useState } from "react";
import CommentItem from "./CommentItem";
import type { Comment } from "../../../types/comment";

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  onToggleLike: (commentId: string) => void;
  onReply: (comment: Comment) => void;
}

export default function CommentList({
  comments,
  isLoading,
  onToggleLike,
  onReply,
}: CommentListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpanded(parentId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) next.delete(parentId);
      else next.add(parentId);
      return next;
    });
  }

  // Al responder, abre el hilo para que se vea la respuesta nueva
  function handleReply(comment: Comment) {
    const threadId = comment.parentId ?? comment.id;
    setExpanded((prev) => new Set(prev).add(threadId));
    onReply(comment);
  }

  if (isLoading) {
    return <p className="text-sm text-foreground/50 text-center py-6">Cargando comentarios...</p>;
  }

  if (comments.length === 0) {
    return (
      <p className="text-sm text-foreground/50 text-center py-6">
        Sé el primero en comentar.
      </p>
    );
  }

  const topLevel = comments.filter((c) => !c.parentId);

  const repliesByParent: Record<string, Comment[]> = {};
  for (const c of comments) {
    if (c.parentId) {
      if (!repliesByParent[c.parentId]) repliesByParent[c.parentId] = [];
      repliesByParent[c.parentId].push(c);
    }
  }

  return (
    <div className="flex flex-col divide-y divide-foreground/5">
      {topLevel.map((comment) => {
        const replies = repliesByParent[comment.id] ?? [];
        const isOpen = expanded.has(comment.id);

        return (
          <div key={comment.id}>
            <CommentItem
              comment={comment}
              onToggleLike={onToggleLike}
              onReply={handleReply}
            />

            {replies.length > 0 && (
              <div className="ml-11 pb-2">
                <button
                  onClick={() => toggleExpanded(comment.id)}
                  className="text-xs text-foreground/50 hover:text-foreground mb-1"
                >
                  {isOpen
                    ? "Ocultar respuestas"
                    : `Ver ${replies.length} ${replies.length === 1 ? "respuesta" : "respuestas"}`}
                </button>

                {isOpen &&
                  replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      onToggleLike={onToggleLike}
                      onReply={handleReply}
                      isReply
                    />
                  ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}