export interface Comment {
  id: string;
  postId: string;
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

export interface NewCommentInput {
  text: string;
  parentId?: string;
  replyToUsername?: string;
}