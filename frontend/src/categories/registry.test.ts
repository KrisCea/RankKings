import { describe, expect, it } from "vitest";
import { CATEGORY_DEFINITIONS, CATEGORY_LIST, mapCategories } from "./registry";
import { ACTIVE_CATEGORIES, CATEGORIES } from "../constants/categories";
import { CATEGORY_CONFIG } from "../constants/categoryConfig";
import { CATEGORY_REQUIREMENTS } from "../constants/categoryRequirements";
import { CHILDREN_LABELS } from "../constants/childrenLabels";

describe("registro de categorías", () => {
  it("define las ocho categorías de forma coherente y alimenta las constantes que usa la app", () => {
    expect(CATEGORY_LIST).toHaveLength(8);
    for (const [id, definition] of Object.entries(CATEGORY_DEFINITIONS)) {
      expect(definition.id).toBe(id);
      expect(definition.vote.icon).toBeDefined();
      expect(definition.list.icon).toBeDefined();
      expect(definition.list.verb).not.toBe("");
    }

    // Las categorías activas son las cuatro principales
    expect([...ACTIVE_CATEGORIES].sort()).toEqual(["art", "books", "movies", "music"]);

    // Los archivos de constants leen del registro
    expect(CATEGORIES.music.label).toBe("Música");
    expect(CATEGORY_CONFIG.movies.likeIcon).toBe(CATEGORY_DEFINITIONS.movies.vote.icon);
    expect(CATEGORY_REQUIREMENTS.books[0].key).toBe("isbn");
    expect(CHILDREN_LABELS.music).toBe("Canciones");

    // mapCategories construye un registro con una entrada por categoría
    const labels = mapCategories((category) => category.label);
    expect(Object.keys(labels)).toHaveLength(8);
    expect(labels.art).toBe("Arte");
  });
});