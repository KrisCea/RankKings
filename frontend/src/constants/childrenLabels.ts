import { mapCategories } from "../categories/registry";
import type { CategoryId } from "../categories/types";

// Cómo se llama el contenido de una colección según la categoría
export const CHILDREN_LABELS: Record<CategoryId, string> = mapCategories(
  (c) => c.childrenLabel
);