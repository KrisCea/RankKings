import { mapCategories } from "../categories/registry";
import type { CategoryId } from "../categories/types";
import type { IdentifierDefinition } from "../types/identifier";

export const CATEGORY_REQUIREMENTS: Record<CategoryId, IdentifierDefinition[]> =
  mapCategories((c) => c.identifiers);