import { CATEGORY_DEFINITIONS } from "../../../categories/registry";
import { LIST_ADD_LABEL, LIST_ADDED_LABEL } from "../../../constants/lists";
import { useRequireAuth } from "../../auth/hooks/useRequireAuth";
import { useSaveItem } from "../hooks/useSaveItem";
import type { RankableItem } from "../../../types/rankableItem";

interface SaveButtonProps {
  item: RankableItem;
  variant?: "full" | "icon";
  className?: string;
}

export default function SaveButton({ item, variant = "full", className = "" }: SaveButtonProps) {
  const save = useSaveItem();
  const requireAuth = useRequireAuth();
  const { icon: Icon, verb } = CATEGORY_DEFINITIONS[item.category].list;

  const saved = item.savedByCurrentUser;
  const label = saved ? LIST_ADDED_LABEL : LIST_ADD_LABEL;

  // Sin sesión lleva al login; con sesión agrega o quita el ítem de la lista
  const handleClick = requireAuth(() => save.mutate({ itemId: item.id, saved: !saved }));

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={save.isPending}
        aria-pressed={saved}
        aria-label={label}
        title={label}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-60 ${
          saved
            ? "bg-primary/10 text-primary"
            : "text-foreground/60 hover:bg-surface hover:text-primary"
        } ${className}`}
      >
        <Icon size={18} fill={saved ? "currentColor" : "none"} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={save.isPending}
      aria-pressed={saved}
      title={verb}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
        saved
          ? "border-primary bg-primary/10 text-primary"
          : "border-foreground/10 text-foreground hover:border-primary hover:text-primary"
      } ${className}`}
    >
      <Icon size={16} fill={saved ? "currentColor" : "none"} />
      {label}
    </button>
  );
}