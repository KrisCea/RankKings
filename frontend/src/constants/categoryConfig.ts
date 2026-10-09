import type { LucideIcon } from "lucide-react";
import { mapCategories } from "../categories/registry";
import type { CategoryId } from "../categories/types";

export interface CategoryConfig {
  label: string;
  theme: CategoryId;
  itemLabel: string;
  likeIcon: LucideIcon;
  likeLabel: string;
}

export const CATEGORY_CONFIG: Record<CategoryId, CategoryConfig> = mapCategories((c) => ({
  label: c.label,
  theme: c.id,
  itemLabel: c.itemLabel,
  likeIcon: c.vote.icon,
  likeLabel: c.vote.label,
}));