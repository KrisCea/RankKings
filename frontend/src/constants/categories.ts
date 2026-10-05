export type CategoryId =
  | "music"
  | "podcasts"
  | "books"
  | "movies"
  | "concerts"
  | "videogames"
  | "art"
  | "boardgames";

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  itemLabel: string;
}

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  music:      { id: "music",      label: "Música",         itemLabel: "disco/canción" },
  podcasts:   { id: "podcasts",   label: "Podcasts",        itemLabel: "episodio" },
  books:      { id: "books",      label: "Libros",          itemLabel: "libro" },
  movies:     { id: "movies",     label: "Películas",       itemLabel: "película" },
  concerts:   { id: "concerts",   label: "Conciertos",      itemLabel: "concierto" },
  videogames: { id: "videogames", label: "Videojuegos",     itemLabel: "videojuego" },
  art:        { id: "art",        label: "Arte",            itemLabel: "obra" },
  boardgames: { id: "boardgames", label: "Juegos de mesa",  itemLabel: "juego" },
};

export const ACTIVE_CATEGORIES: CategoryId[] = ["movies", "music", "books", "art"];