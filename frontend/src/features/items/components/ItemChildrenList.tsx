import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { RankableItem } from "../../../types/rankableItem";

interface ItemChildrenListProps {
  items: RankableItem[];
  isLoading: boolean;
}

export default function ItemChildrenList({ items, isLoading }: ItemChildrenListProps) {
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-foreground/50">Cargando...</p>;
  }

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-foreground/50">Todavía no hay contenido.</p>
    );
  }

  return (
    <ol className="flex flex-col divide-y divide-foreground/5">
      {items.map((child) => (
        <li key={child.id}>
          <Link
            to={`/item/${child.id}`}
            className="flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-surface"
          >
            <span className="w-6 text-center text-sm text-foreground/40">
              {child.position ?? "·"}
            </span>
            <img
              src={child.coverUrl}
              alt={child.title}
              className="h-10 w-10 shrink-0 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{child.title}</p>
              <p className="truncate text-xs text-foreground/50">{child.creator.name}</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-foreground/70">
              <Star size={12} className="text-primary" fill="currentColor" />
              {child.averageRating.toFixed(1)}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}