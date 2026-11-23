import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send, X } from "lucide-react";

interface CommentInputProps {
  onSubmit: (text: string) => void;
  isSubmitting: boolean;
  replyingTo?: string | null;
  onCancelReply: () => void;
}

export default function CommentInput({
  onSubmit,
  isSubmitting,
  replyingTo,
  onCancelReply,
}: CommentInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Al empezar a responder, enfoca el input automáticamente
  useEffect(() => {
    if (replyingTo) inputRef.current?.focus();
  }, [replyingTo]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSubmitting) return;
    onSubmit(trimmed);
    setText("");
  }

  return (
    <div className="border-t border-foreground/10 pt-3 mt-2">
      {replyingTo && (
        <div className="flex items-center justify-between mb-2 px-1 text-xs text-foreground/60">
          <span>
            Respondiendo a <span className="text-primary">@{replyingTo}</span>
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="Cancelar respuesta"
            className="rounded-full p-1 hover:bg-surface"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={replyingTo ? `Responder a @${replyingTo}...` : "Escribe un comentario..."}
          className="flex-1 rounded-full border border-foreground/10 bg-background px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={!text.trim() || isSubmitting}
          aria-label="Enviar comentario"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40 transition-opacity"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}