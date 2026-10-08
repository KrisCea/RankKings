import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Menu, X } from "lucide-react";
import CategoriesDropdown from "./CategoriesDropdown";
import ProfileMenu from "./ProfileMenu";
import MobileMenu from "./MobileMenu";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export default function Navbar() {
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  function toggleMobilePanel() {
    setMobileSearchOpen(false);
    setMobilePanelOpen((o) => !o);
  }

  function toggleMobileSearch() {
    setMobilePanelOpen(false);
    setMobileSearchOpen((o) => !o);
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-foreground/10">
      <nav className="mx-auto flex max-w-6xl 2xl:max-w-7xl items-center gap-4 px-6 py-4">
        <Link to="/" className="shrink-0 text-lg font-semibold tracking-tight text-accent">
          RankKings
        </Link>

        <ul className="hidden shrink-0 items-center gap-6 md:flex">
          <li>
            <CategoriesDropdown />
          </li>
          <li>
            <Link to="/" className="text-sm text-foreground transition-colors hover:text-primary">
              Para ti
            </Link>
          </li>
        </ul>

        <div className="hidden flex-1 md:flex md:items-center md:gap-2 max-w-md">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50"
            />
            <input
              type="text"
              placeholder="Buscar…"
              className="w-full rounded-full border border-foreground/10 bg-background py-2 pl-9 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>
          <button
            aria-label="Publicar"
            title="Publicar"
            className="flex aspect-square h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-transform hover:scale-105"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <button
            aria-label="Buscar"
            aria-expanded={mobileSearchOpen}
            onClick={toggleMobileSearch}
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-surface md:hidden"
          >
            <Search size={18} />
          </button>

          <button
            aria-label="Publicar"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white md:hidden"
          >
            <Plus size={18} />
          </button>
          
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-surface"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <ProfileMenu />

          

          <button
            aria-label="Abrir menú"
            aria-expanded={mobilePanelOpen}
            onClick={toggleMobilePanel}
            className="inline-flex items-center justify-center rounded-md p-2 text-primary md:hidden"
          >
            {mobilePanelOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {mobileSearchOpen && (
        <div className="border-t border-foreground/10 px-6 py-3 md:hidden">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50"
              />
              <input
                type="text"
                placeholder="Buscar…"
                autoFocus
                className="w-full rounded-full border border-foreground/10 bg-surface py-2 pl-9 pr-4 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <button
              aria-label="Cerrar búsqueda"
              onClick={() => setMobileSearchOpen(false)}
              className="shrink-0 rounded-md p-2 text-foreground hover:bg-surface"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <MobileMenu open={mobilePanelOpen} onClose={() => setMobilePanelOpen(false)} />
    </header>
  );
}