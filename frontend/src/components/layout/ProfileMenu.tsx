import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useCurrentUser } from "../../features/users/hooks/useCurrentUser";
import Avatar from "../../components/ui/Avatar";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: user, isLoading } = useCurrentUser();

  useClickOutside(ref, () => setOpen(false));

  if (isLoading) {
    return <div className="h-8 w-8 rounded-full bg-surface animate-pulse" />;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-surface"
      >
        {user?.isAuthenticated ? (
          <Avatar src={user.avatarUrl} alt={user.displayName} size={36} />
        ) : (
          <div className="h-8 w-8 rounded-full bg-surface" />
        )}
        <ChevronDown
          size={16}
          className={`text-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-foreground/10 bg-background py-2 shadow-lg">
          {user?.isAuthenticated ? (
            <>
              <div className="border-b border-foreground/10 px-4 py-2.5">
                <p className="text-sm font-medium text-primary">{user.displayName}</p>
                <p className="text-xs text-foreground/60">@{user.username}</p>
              </div>
              <Link to={`/profile/${user.username}`} className="block px-4 py-2 text-sm hover:bg-surface">
                Ver perfil
              </Link>
              <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-surface">
                Configuración
              </Link>
              <div className="my-1 border-t border-foreground/10" />
              <button className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-surface">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block px-4 py-2 text-sm hover:bg-surface">
                Iniciar sesión
              </Link>
              <Link to="/register" className="block px-4 py-2 text-sm hover:bg-surface">
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}