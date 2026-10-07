import { api } from "../../lib/axios";
import { mockComments as initialMockComments } from "../../mocks/comments";
import { getMockSessionUser } from "../../mocks/accounts";
import type { Comment, NewCommentInput } from "../../types/comment";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

// MOCK: estado mutable en memoria, simula persistencia mientras no hay backend.
let mockCommentsState: Comment[] = [...initialMockComments];

export async function getComments(postId: string): Promise<Comment[]> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 250));
    return mockCommentsState
      .filter((c) => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  // BACKEND: lista plana con parentId; el frontend agrupa los hilos
  const { data } = await api.get<Comment[]>(`/posts/${postId}/comments`);
  return data;
}

export async function addComment(postId: string, input: NewCommentInput): Promise<Comment> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 200));

    const me = getMockSessionUser();
    if (!me) throw new Error("Debes iniciar sesión para comentar");

    const newComment: Comment = {
      id: `c${Date.now()}`,
      postId,
      parentId: input.parentId,
      replyToUsername: input.replyToUsername,
      author: { id: me.id, username: me.username, avatarUrl: me.avatarUrl },
      text: input.text,
      likesCount: 0,
      likedByCurrentUser: false,
      createdAt: new Date().toISOString(),
    };
    mockCommentsState.push(newComment);
    return newComment;
  }

  // BACKEND: el autor se resuelve desde la sesión (nunca se envía desde el frontend).
  // Body: { text, parentId?, replyToUsername? }. Sin sesión: 401.
  const { data } = await api.post<Comment>(`/posts/${postId}/comments`, input);
  return data;
}

export async function toggleCommentLike(commentId: string): Promise<Comment> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 150));
    const index = mockCommentsState.findIndex((c) => c.id === commentId);
    if (index === -1) throw new Error("Comentario no encontrado");

    const comment = mockCommentsState[index];
    const updated: Comment = {
      ...comment,
      likedByCurrentUser: !comment.likedByCurrentUser,
      likesCount: comment.likedByCurrentUser ? comment.likesCount - 1 : comment.likesCount + 1,
    };

    mockCommentsState[index] = updated;
    return updated;
  }

  const { data } = await api.post<Comment>(`/comments/${commentId}/like`);
  return data;
}