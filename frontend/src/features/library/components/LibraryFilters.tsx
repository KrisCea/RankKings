import type { CategoryId } from "../../../categories/types";

export interface LibraryFilterOption {
  id: CategoryId;
  label: string;
  count: number;
}

interface LibraryFiltersProps {
  options: LibraryFilterOption[];
  total: number;
  active: CategoryId | null;
  onChange: (id: CategoryId | null) => void;
}

const BASE = "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors";

export default function LibraryFilters({ options, total, active, onChange }: LibraryFiltersProps) {
  return (
    <div
      role="group"
      aria-label="Filtrar por categoría"
      className="mb-4 flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
    >
      <button
        type="button"
        aria-pressed={active === null}
        onClick={() => onChange(null)}
        className={`${BASE} ${
          active === null
            ? "border-primary bg-primary text-white"
            : "border-foreground/10 text-foreground/70 hover:text-foreground"
        }`}
      >
        Todo <span className="ml-1 opacity-70">{total}</span>
      </button>

      {options.map((option) => {
        const isActive = option.id === active;
        return (
          <button
            key={option.id}
            type="button"
            data-theme={option.id} // cada chip usa el color de su categoría
            aria-pressed={isActive}
            onClick={() => onChange(option.id)}
            className={`${BASE} ${
              isActive
                ? "border-primary bg-primary text-white"
                : "border-foreground/10 text-foreground/70 hover:border-primary hover:text-primary"
            }`}
          >
            {option.label} <span className="ml-1 opacity-70">{option.count}</span>
          </button>
        );
      })}
    </div>
  );
}