import { ExternalLink as OpenIcon, Globe, Play, ShoppingBag, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ExternalLink, ExternalLinkType } from "../../../types/externalLink";

const ICONS: Record<ExternalLinkType, LucideIcon> = {
  streaming: Play,
  store: ShoppingBag,
  social: Users,
  other: Globe,
};

// Solo se aceptan http/https (evita esquemas como javascript:). La moderación real es del backend.
function parseSafeUrl(url: string): URL | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed : null;
  } catch {
    return null;
  }
}

interface ExternalLinksProps {
  links: ExternalLink[];
}

export default function ExternalLinks({ links }: ExternalLinksProps) {
  const entries = links.flatMap((link) => {
    const parsed = parseSafeUrl(link.url);
    return parsed ? [{ link, host: parsed.hostname }] : [];
  });

  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-foreground/50">
        Todavía no hay enlaces para este ítem.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map(({ link, host }) => {
        const Icon = ICONS[link.type];
        return (
          <li key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-surface p-3 transition-colors hover:border-primary"
            >
              <Icon size={18} className="text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{link.label}</p>
                <p className="truncate text-xs text-foreground/50">{host}</p>
              </div>
              <OpenIcon size={14} className="text-foreground/40" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}