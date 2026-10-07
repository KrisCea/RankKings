import { Link } from "react-router-dom";
import { ChevronRight, Star } from "lucide-react";
import VerificationBadge from "./VerificationBadge";
import type { RankableItem } from "../../../types/rankableItem";

interface RankableItemSummaryProps {
  item: RankableItem;
}

export default function RankableItemSummary({ item }: RankableItemSummaryProps) {
  return (
    <Link
      to={`/item/${item.id}`}
      className="flex items-center gap-3 rounded-lg border border-foreground/10 bg-background p-2.5 transition-colors hover:border-primary"
    >
      <img
        src={item.coverUrl}
        alt={item.title}
        className="h-16 w-16 shrink-0 rounded-md object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
        <p className="truncate text-xs text-foreground/50">
          {item.creator.name}
          {item.year && ` · ${item.year}`}
        </p>
        <div className="mt-1 flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-foreground/70">
            <Star size={12} className="text-primary" fill="currentColor" />
            {item.averageRating.toFixed(1)}
            <span className="text-foreground/40">({item.ratingsCount})</span>
          </span>
          <VerificationBadge status={item.verificationStatus} />
        </div>
      </div>
      <ChevronRight size={18} className="shrink-0 text-foreground/30" />
    </Link>
  );
}