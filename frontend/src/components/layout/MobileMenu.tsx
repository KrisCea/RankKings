import { Link } from "react-router-dom";
import { CATEGORIES } from "../../constants/categories";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  if (!open) return null;

  return (
    <div className="border-t border-foreground/10 md:hidden">
      <ul className="flex flex-col gap-1 px-6 py-4">
        <li className="px-2 py-1.5 text-xs font-semibold uppercase text-foreground/50">
          Categorías
        </li>
        {Object.values(CATEGORIES).map((cat) => (
          <li key={cat.id}>
            <Link
              to={`/${cat.id}`}
              onClick={onClose}
              className="block rounded-md px-2 py-2.5 text-sm text-foreground hover:bg-surface"
            >
              {cat.label}
            </Link>
          </li>
        ))}
        <li>
          <Link
            to="/"
            onClick={onClose}
            className="block rounded-md px-2 py-2.5 text-sm text-foreground hover:bg-surface"
          >
            Para ti
          </Link>
        </li>
      </ul>
    </div>
  );
}