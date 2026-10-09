import { useMemo } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import LibraryFilters from "../../features/library/components/LibraryFilters";
import LibraryItemRow from "../../features/library/components/LibraryItemRow";
import { useSavedItems } from "../../features/library/hooks/useSavedItems";
import { useCurrentUser } from "../../features/users/hooks/useCurrentUser";
import { CATEGORY_LIST } from "../../categories/registry";
import type { CategoryId } from "../../categories/types";
import { LIST_NAME } from "../../constants/lists";

const FILTER_PARAM = "categoria";

export default function LibraryPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: saved, isLoading } = useSavedItems(Boolean(user));
  const [searchParams, setSearchParams] = useSearchParams();

  const counts = useMemo(() => {
    const map = new Map<CategoryId, number>();
    for (const { item } of saved ?? []) {
      map.set(item.category, (map.get(item.category) ?? 0) + 1);
    }
    return map;
  }, [saved]);

  if (userLoading) {
    return <div className="mx-auto h-64 max-w-2xl animate-pulse rounded-xl bg-surface" />;
  }

  // La lista es personal: sin sesión lleva al login y vuelve aquí
  if (!user) {
    return (
      <Navigate to="/login" replace state={{ from: "/library", reason: "auth-required" }} />
    );
  }

  const entries = saved ?? [];

  // Solo se ofrecen las categorías en las que hay algo guardado (en el orden del registro)
  const options = CATEGORY_LIST.filter((c) => (counts.get(c.id) ?? 0) > 0).map((c) => ({
    id: c.id,
    label: c.label,
    count: counts.get(c.id) ?? 0,
  }));

  // Si la URL trae una categoría inválida o ya vacía, se muestra todo
  const requested = searchParams.get(FILTER_PARAM);
  const active: CategoryId | null = options.find((o) => o.id === requested)?.id ?? null;
  const visible = active ? entries.filter((e) => e.item.category === active) : entries;

  function selectFilter(id: CategoryId | null) {
    setSearchParams(id ? { [FILTER_PARAM]: id } : {}, { replace: true });
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">{LIST_NAME}</h1>
      <p className="mb-6 text-sm text-foreground/60">
        Lo que quieres ver, escuchar o visitar más adelante.
      </p>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      )}

      {!isLoading && entries.length === 0 && (
        <div className="rounded-xl border border-dashed border-foreground/20 p-8 text-center">
          <p className="text-sm text-foreground/60">Todavía no agregaste nada a tu lista.</p>
          <Link to="/" className="mt-2 inline-block text-sm text-primary hover:underline">
            Explorar el inicio
          </Link>
        </div>
      )}

      {!isLoading && entries.length > 0 && (
        <>
          {options.length > 1 && (
            <LibraryFilters
              options={options}
              total={entries.length}
              active={active}
              onChange={selectFilter}
            />
          )}

          <ul className="flex flex-col gap-3">
            {visible.map((entry) => (
              <LibraryItemRow key={entry.item.id} entry={entry} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}