import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useCurrentUser } from "../../features/users/hooks/useCurrentUser";
import { getErrorMessage } from "../../lib/errors";

interface DeleteContentButtonProps {
  ownerId: string;
  label: string;
  confirmationMessage: string;
  onDelete: () => Promise<unknown>;
  queryKeys: QueryKey[];
  onDeleted?: () => void;
  showText?: boolean;
}

export default function DeleteContentButton({
  ownerId,
  label,
  confirmationMessage,
  onDelete,
  queryKeys,
  onDeleted,
  showText = false,
}: DeleteContentButtonProps) {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const deletion = useMutation({
    mutationFn: onDelete,
    onSuccess: async () => {
      onDeleted?.();
      await Promise.all(
        queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
      );
    },
  });

  if (!user || (user.id !== ownerId && user.role !== "admin")) return null;

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        aria-label={label}
        title={label}
        disabled={deletion.isPending}
        onClick={() => {
          if (window.confirm(confirmationMessage)) deletion.mutate();
        }}
        className="inline-flex items-center gap-1.5 rounded-full p-1.5 text-foreground/50 transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
      >
        <Trash2 size={16} />
        <span className={showText ? "text-sm" : "sr-only"}>{label}</span>
      </button>
      {deletion.error && (
        <span role="alert" className="text-xs text-red-500">
          {getErrorMessage(deletion.error)}
        </span>
      )}
    </span>
  );
}
