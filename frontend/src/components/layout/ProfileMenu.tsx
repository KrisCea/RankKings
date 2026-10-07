import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "../ui/Avatar";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useCurrentUser } from "../../features/users/hooks/useCurrentUser";
import { useLogout } from "../../features/auth/hooks/useLogout";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();

  useClickOutside(ref, () => setOpen(false));

  function handleLogout() {
    setOpen(false);
    logout.mutate(undefined, { onSuccess: () => navigate("/") });
  }

  if (isLoading) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-surface" />;
  }

  // Visitante: en vez del menú del avatar, un acceso directo a iniciar sesión
  if (!user) {
    return (
      <Link
        to="/login"
        className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Iniciar sesión
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-surface"
      >
        <Avatar src={user.avatarUrl} alt={user.displayName} size={32} />
        <ChevronDown
          size={16}
          className={`text-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-foreground/10 bg-background py-2 shadow-lg">
          <div className="border-b border-foreground/10 px-4 py-2.5">
            <p className="text-sm font-medium text-primary">{user.displayName}</p>
            <p className="text-xs text-foreground/60">@{user.username}</p>
          </div>

          <Link
            to={`/profile/${user.username}`}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm hover:bg-surface"
          >
            Ver perfil
          </Link>
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm hover:bg-surface"
          >
            Configuración
          </Link>

          <div className="my-1 border-t border-foreground/10" />

          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-surface disabled:opacity-60"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}