import { CATEGORY_DEFINITIONS, CATEGORY_LIST } from "../categories/registry";
import type { CategoryId } from "../categories/types";

export type { CategoryId };

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  itemLabel: string;
}

// Las definiciones completas son compatibles con CategoryMeta
export const CATEGORIES: Record<CategoryId, CategoryMeta> = CATEGORY_DEFINITIONS;

// Categorías con flujo completo implementado por ahora.
export const ACTIVE_CATEGORIES: CategoryId[] = CATEGORY_LIST.filter((c) => c.active).map(
  (c) => c.id
);