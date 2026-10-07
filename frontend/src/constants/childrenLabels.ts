import type { CategoryId } from "./categories";

// Cómo se llama el contenido de una colección según la categoría
export const CHILDREN_LABELS: Record<CategoryId, string> = {
  music: "Canciones",
  podcasts: "Episodios",
  books: "Capítulos",
  movies: "Capítulos",
  concerts: "Canciones",
  videogames: "Contenido",
  art: "Obras",
  boardgames: "Expansiones",
};