import type { RankableItem } from "../types/rankableItem";
import { mockCreators } from "./creators";

export const mockRankableItems: RankableItem[] = [
  {
    id: "ri1",
    category: "movies",
    title: "Oppenheimer",
    creator: mockCreators[0], // Christopher Nolan
    uploadedBy: "2", // Ana
    year: 2023,
    coverUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    identifiers: { imdbId: "tt15398776" },
    verificationStatus: "verified",
    createdAt: "2026-09-20T10:00:00Z",
  },
  {
    id: "ri2",
    category: "music",
    title: "Random Access Memories",
    creator: mockCreators[1], // Daft Punk
    uploadedBy: "3", // Sony Music
    year: 2013,
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/a/a7/Random_Access_Memories.jpg",
    identifiers: { isrc: "FR-ZYX-13-00001", genre: "Electrónica" },
    verificationStatus: "verified",
    createdAt: "2026-09-18T15:30:00Z",
  },
  {
    id: "ri3",
    category: "books",
    title: "Cien años de soledad",
    creator: mockCreators[2], // García Márquez
    uploadedBy: "4", // Pedro
    year: 1967,
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Gabriel_Garcia_Marquez_Cien_anos_de_soledad.jpg",
    identifiers: { isbn: "9780307474728" },
    verificationStatus: "verified",
    createdAt: "2026-09-15T09:00:00Z",
  },
  {
    id: "ri4",
    category: "art",
    title: "La noche estrellada",
    creator: mockCreators[3], // Van Gogh
    uploadedBy: "1", // el usuario actual
    year: 1889,
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
    identifiers: {},
    verificationStatus: "partial",
    createdAt: "2026-09-22T12:00:00Z",
  },
];