import { Star, Music2, Palette, BookMarked, Mic, Clapperboard, Gamepad2, Dices } from "lucide-react";
import type { CategoryId } from "./categories";

export interface CategoryConfig {
  label: string;
  theme: CategoryId;
  likeIcon: typeof Star;
  likeLabel: string;
  itemLabel: string;
}

export const CATEGORY_CONFIG: Record<CategoryId, CategoryConfig> = {
  movies: {
    label: "Películas",
    theme: "movies",
    likeIcon: Clapperboard,
    likeLabel: "Dar voto",
    itemLabel: "película",
  },
  music: {
    label: "Música",
    theme: "music",
    likeIcon: Music2,
    likeLabel: "Dar voto",
    itemLabel: "disco",
  },
  art: {
    label: "Arte",
    theme: "art",
    likeIcon: Palette,
    likeLabel: "Dar voto",
    itemLabel: "obra",
  },
  books: {
    label: "Libros",
    theme: "books",
    likeIcon: BookMarked,
    likeLabel: "Dar voto",
    itemLabel: "libro",
  },
  podcasts: {
    label: "Podcasts",
    theme: "podcasts",
    likeIcon: Mic,
    likeLabel: "Dar voto",
    itemLabel: "episodio",
  },
  concerts: {
    label: "Conciertos",
    theme: "concerts",
    likeIcon: Star,
    likeLabel: "Dar voto",
    itemLabel: "concierto",
  },
  videogames: {
    label: "Videojuegos",
    theme: "videogames",
    likeIcon: Gamepad2,
    likeLabel: "Dar voto",
    itemLabel: "videojuego",
  },
  boardgames: {
    label: "Juegos de mesa",
    theme: "boardgames",
    likeIcon: Dices,
    likeLabel: "Dar voto",
    itemLabel: "juego",
  },
};