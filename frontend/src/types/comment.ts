import type { PostMedia } from "./post";

export interface Comment {
  id: string;
  postId: string;
  kind?: "comment" | "review";
  authorScore?: number;
  parentId?: string;          // si es una respuesta, id del comentario principal del hilo
  replyToUsername?: string;   // a quién responde (para mostrar la mención @usuario)
  author: {
    id: string;
    username: string;
    avatarUrl: string;
  };
  text: string;
  likesCount: number;
  likedByCurrentUser: boolean;
  createdAt: string;
}

export interface Review extends Comment {
  kind: "review";
  media?: PostMedia[];
}

export interface NewCommentInput {
  text: string;
  parentId?: string;
  replyToUsername?: string;
}