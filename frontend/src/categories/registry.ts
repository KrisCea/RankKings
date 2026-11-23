import type { LucideIcon } from "lucide-react";
import { art } from "./definitions/art";
import { boardgames } from "./definitions/boardgames";
import { books } from "./definitions/books";
import { concerts } from "./definitions/concerts";
import { movies } from "./definitions/movies";
import { music } from "./definitions/music";
import { podcasts } from "./definitions/podcasts";
import { videogames } from "./definitions/videogames";
import type { CategoryDefinition, CategoryId } from "./types";
import type { IdentifierDefinition } from "../types/identifier";

export interface CategoryConfig {
  label: string;
  theme: CategoryId;
  itemLabel: string;
  likeIcon: LucideIcon;
  likeLabel: string;
}

// Record<CategoryId, ...> obliga a registrar todas las categorías: si falta una, no compila.
// El orden de este objeto es el orden en que aparecen en menús y filtros.
export const CATEGORY_DEFINITIONS: Record<CategoryId, CategoryDefinition> = {
  music,
  podcasts,
  books,
  movies,
  concerts,
  videogames,
  art,
  boardgames,
};

export const CATEGORY_LIST: CategoryDefinition[] = Object.values(CATEGORY_DEFINITIONS);
export const ACTIVE_CATEGORIES: CategoryId[] = CATEGORY_LIST.filter(({ active }) => active).map(
  ({ id }) => id
);

// Construye un Record<CategoryId, T> a partir de las definiciones
export function mapCategories<T>(
  pick: (category: CategoryDefinition) => T
): Record<CategoryId, T> {
  return Object.fromEntries(
    CATEGORY_LIST.map((category) => [category.id, pick(category)] as const)
  ) as Record<CategoryId, T>;
}

export const CATEGORIES: Record<CategoryId, Omit<CategoryDefinition, "identifiers" | "vote" | "list">> = mapCategories(
  ({ id, label, itemLabel, childrenLabel, active }) => ({
    id,
    label,
    itemLabel,
    childrenLabel,
    active,
  })
);

export const CHILDREN_LABELS: Record<CategoryId, string> = mapCategories(
  ({ childrenLabel }) => childrenLabel
);

export const CATEGORY_REQUIREMENTS: Record<CategoryId, IdentifierDefinition[]> =
  mapCategories(({ identifiers }) => identifiers);

export const CATEGORY_CONFIG: Record<CategoryId, CategoryConfig> = mapCategories(
  ({ id, label, itemLabel, vote }) => ({
    label,
    theme: id,
    itemLabel,
    likeIcon: vote.icon,
    likeLabel: vote.label,
  })
);