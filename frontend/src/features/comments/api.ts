import { api } from "../../lib/axios";
import type { Comment, NewCommentInput } from "../../types/comment";

export async function getComments(postId: string): Promise<Comment[]> {
  const { data } = await api.get<Comment[]>(`/posts/${postId}/comments`);
  return data;
}

export async function addComment(postId: string, input: NewCommentInput): Promise<Comment> {
  const { data } = await api.post<Comment>(`/posts/${postId}/comments`, input);
  return data;
}

export async function toggleCommentLike(commentId: string): Promise<Comment> {
  const { data } = await api.post<Comment>(`/comments/${commentId}/like`);
  return data;
}