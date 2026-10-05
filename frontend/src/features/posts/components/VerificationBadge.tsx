import { BadgeCheck, ShieldAlert } from "lucide-react";
import type { VerificationStatus } from "../../../types/rankableItem";

interface VerificationBadgeProps {
  status: VerificationStatus;
}

export default function VerificationBadge({ status }: VerificationBadgeProps) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-primary" title="Verificado">
        <BadgeCheck size={14} />
        Verificado
      </span>
    );
  }

  if (status === "partial") {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs text-foreground/50"
        title="Verificación parcial"
      >
        <ShieldAlert size={14} />
        Parcial
      </span>
    );
  }

  return null; // unverified: sin insignia
}