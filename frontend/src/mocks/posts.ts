import type { Post } from "../types/post";
import { mockRankableItems } from "./rankableItems";
import { mockCurrentUser, mockUsers } from "./users";

export const mockPosts: Post[] = [
  {
    id: "p1",
    category: "movies",
    author: mockUsers[0], // Ana
    caption: "Una obra maestra sobre el peso de la responsabilidad científica.",
    media: [
      {
        id: "m1",
        url: "https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        type: "image",
      },
    ],
    rankableItem: mockRankableItems[0],
    votesCount: 128,
    votedByCurrentUser: false,
    averageRating: 8.9,
    ratingsCount: 214,
    currentUserRating: undefined,
    commentsCount: 34,
    sharesCount: 12,
    moderationStatus: "approved",
    createdAt: "2026-09-20T10:05:00Z",
    isReelEligible: false,
  },
  {
    id: "p2",
    category: "music",
    author: mockUsers[1], // Sony Music
    caption: "El disco que redefinió la música electrónica moderna.",
    media: [
      {
        id: "m2",
        url: "https://upload.wikimedia.org/wikipedia/en/a/a7/Random_Access_Memories.jpg",
        type: "image",
      },
    ],
    rankableItem: mockRankableItems[1],
    votesCount: 256,
    votedByCurrentUser: true,
    averageRating: 9.2,
    ratingsCount: 401,
    currentUserRating: 9.5,
    commentsCount: 58,
    sharesCount: 40,
    moderationStatus: "approved",
    createdAt: "2026-09-18T15:35:00Z",
    isReelEligible: false,
  },
  {
    id: "p3",
    category: "books",
    author: mockUsers[2], // Pedro
    caption: "Realismo mágico en su máxima expresión.",
    media: [
      {
        id: "m3",
        url: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Gabriel_Garcia_Marquez_Cien_anos_de_soledad.jpg",
        type: "image",
      },
    ],
    rankableItem: mockRankableItems[2],
    votesCount: 89,
    votedByCurrentUser: false,
    averageRating: 9.5,
    ratingsCount: 150,
    currentUserRating: undefined,
    commentsCount: 21,
    sharesCount: 9,
    moderationStatus: "approved",
    createdAt: "2026-09-15T09:10:00Z",
    isReelEligible: false,
  },
  {
    id: "p4",
    category: "art",
    author: mockCurrentUser,
    caption: "Un ícono del post-impresionismo.",
    media: [
      {
        id: "m4",
        url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
        type: "image",
      },
    ],
    rankableItem: mockRankableItems[3],
    votesCount: 64,
    votedByCurrentUser: false,
    averageRating: 8.7,
    ratingsCount: 98,
    currentUserRating: undefined,
    commentsCount: 15,
    sharesCount: 6,
    moderationStatus: "approved",
    createdAt: "2026-09-22T12:10:00Z",
    isReelEligible: false,
  },
];