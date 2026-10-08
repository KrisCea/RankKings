import { useLocation, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../users/hooks/useCurrentUser";

// Envuelve una acción: con sesión la ejecuta; sin sesión lleva al login y vuelve a este lugar después.
export function useRequireAuth() {
  const { data: user, isLoading } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  return <Args extends unknown[]>(action: (...args: Args) => void) =>
    (...args: Args) => {
      if (isLoading) return; // todavía no se sabe si hay sesión
      if (!user) {
        navigate("/login", {
          state: { from: location.pathname + location.search, reason: "auth-required" },
        });
        return;
      }
      action(...args);
    };
}