import { List, Clapperboard, LayoutGrid } from "lucide-react";
import type { FeedViewMode } from "../../../types/view";

interface ViewTabsProps {
  active: FeedViewMode;
  onChange: (mode: FeedViewMode) => void;
}

const TABS: { mode: FeedViewMode; label: string; icon: typeof List }[] = [
  { mode: "posts", label: "Posteos", icon: List },
  { mode: "reels", label: "Reels", icon: Clapperboard },
  { mode: "gallery", label: "Galería", icon: LayoutGrid },
];

export default function ViewTabs({ active, onChange }: ViewTabsProps) {
  return (
    <div className="sticky top-[73px] z-40 bg-background border-b border-foreground/10 mb-4">
      <div role="tablist" className="flex items-center justify-center gap-1">
        {TABS.map(({ mode, label, icon: Icon }) => {
          const isActive = active === mode;
          return (
            <button
              key={mode}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(mode)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground/60 hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}