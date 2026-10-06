import type { Comment } from "../types/comment";

export const mockComments: Comment[] = [
  {
    id: "c1",
    postId: "p1",
    author: { id: "4", username: "pedro_libros", avatarUrl: "https://ui-avatars.com/api/?name=Pedro+Ramirez&background=7c3aed&color=fff" },
    text: "La cinematografía es impresionante, Nolan nunca falla.",
    likesCount: 12,
    likedByCurrentUser: false,
    createdAt: "2026-09-20T11:00:00Z",
  },
  {
    id: "c2",
    postId: "p1",
    author: { id: "1", username: "crisc", avatarUrl: "https://ui-avatars.com/api/?name=Cristobal&background=6366f1&color=fff" },
    text: "Totalmente de acuerdo, la banda sonora también es increíble.",
    likesCount: 5,
    likedByCurrentUser: true,
    createdAt: "2026-09-20T12:30:00Z",
  },
  {
    id: "c3",
    postId: "p2",
    author: { id: "1", username: "crisc", avatarUrl: "https://ui-avatars.com/api/?name=Cristobal&background=6366f1&color=fff" },
    text: "Get Lucky sigue sonando increíble después de tantos años.",
    likesCount: 20,
    likedByCurrentUser: false,
    createdAt: "2026-09-18T16:00:00Z",
  },
  {
    id: "c4",
    postId: "p1",
    parentId: "c1",
    replyToUsername: "pedro_libros",
    author: { id: "2", username: "ana_reviews", avatarUrl: "https://ui-avatars.com/api/?name=Ana+Torres&background=e11d48&color=fff" },
    text: "Y la escena de la prueba Trinity es de lo mejor del año.",
    likesCount: 3,
    likedByCurrentUser: false,
    createdAt: "2026-09-20T13:00:00Z",
  },
];