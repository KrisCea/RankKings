import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../../constants/categories";
import { useClickOutside } from "../../hooks/useClickOutside";

export default function CategoriesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-1 text-sm text-foreground transition-colors hover:text-primary"
      >
        Categorías
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-48 rounded-xl border border-foreground/10 bg-background py-2 shadow-lg">
          {Object.values(CATEGORIES).map((cat) => (
            <Link
              key={cat.id}
              to={`/${cat.id}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-foreground hover:bg-surface"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}