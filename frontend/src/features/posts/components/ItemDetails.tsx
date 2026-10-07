import { CATEGORY_REQUIREMENTS } from "../../../constants/categoryRequirements";
import VerificationBadge from "./VerificationBadge";
import type { RankableItem } from "../../../types/rankableItem";

interface ItemDetailsProps {
  item: RankableItem;
}

export default function ItemDetails({ item }: ItemDetailsProps) {
  const definitions = CATEGORY_REQUIREMENTS[item.category] ?? [];
  const rows = Object.entries(item.identifiers).map(([key, value]) => ({
    label: definitions.find((d) => d.key === key)?.label ?? key,
    value,
  }));

  return (
    <section className="rounded-xl border border-foreground/10 bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Detalles</h2>
        <VerificationBadge status={item.verificationStatus} />
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-foreground/50">
          Todavía no hay identificadores registrados para este ítem.
        </p>
      ) : (
        <dl className="flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
              <dt className="text-foreground/60">{row.label}</dt>
              <dd className="truncate font-medium text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}