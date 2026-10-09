import { Link } from "react-router-dom";

interface DevVerificationLinkProps {
  url?: string;
}

// Solo en modo demo: sustituye al correo real
export default function DevVerificationLink({ url }: DevVerificationLinkProps) {
  if (!url || import.meta.env.VITE_USE_MOCKS !== "true") return null;

  return (
    <div className="rounded-lg border border-dashed border-foreground/20 p-3 text-xs text-foreground/60">
      Modo demo: aquí llegaría un correo.{" "}
      <Link to={url} className="text-primary hover:underline">
        Abrir el enlace de verificación
      </Link>
    </div>
  );
}