import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { CATEGORY_DEFINITIONS } from "../../../categories/registry";
import SaveButton from "../../items/components/SaveButton";
import type { SavedItem } from "../../../types/savedItem";

interface LibraryItemRowProps {
  entry: SavedItem;
}

export default function LibraryItemRow({ entry }: LibraryItemRowProps) {
  const { item, savedAt } = entry;
  const addedOn = new Date(savedAt).toLocaleDateString("es", { day: "numeric", month: "short" });

  return (
    <li
      data-theme={item.category}
      className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-surface p-3"
    >
      {/* El link y el botón van separados: no puede haber un botón dentro de un link */}
      <Link to={`/item/${item.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <img
          src={item.coverUrl}
          alt={item.title}
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
          <p className="truncate text-xs text-foreground/50">
            {item.creator.name}
            {item.year && ` · ${item.year}`}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
              {CATEGORY_DEFINITIONS[item.category].label}
            </span>
            <span className="flex items-center gap-1 text-foreground/70">
              <Star size={12} className="text-primary" fill="currentColor" />
              {item.averageRating.toFixed(1)}
            </span>
          </div>
          <p className="mt-1 text-xs text-foreground/40">Agregado el {addedOn}</p>
        </div>
      </Link>

      <SaveButton item={item} variant="icon" />
    </li>
  );
}