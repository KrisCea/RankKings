import { api } from "../../lib/axios";
import { mockPosts as initialMockPosts } from "../../mocks/posts";
import type { Post } from "../../types/post";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

// Copia mutable en memoria, para que los mocks "recuerden" cambios entre llamadas
// (simula la persistencia que tendría una base de datos real).
let mockPostsState: Post[] = [...initialMockPosts];

export async function getPosts(): Promise<Post[]> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 300));
    return mockPostsState;
  }

  const { data } = await api.get<Post[]>("/posts");
  return data;
}

export async function toggleVote(postId: string): Promise<Post> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 150));
    const index = mockPostsState.findIndex((p) => p.id === postId);
    if (index === -1) throw new Error("Post no encontrado");

    const post = mockPostsState[index];
    const updated: Post = {
      ...post,
      votedByCurrentUser: !post.votedByCurrentUser,
      votesCount: post.votedByCurrentUser ? post.votesCount - 1 : post.votesCount + 1,
    };

    mockPostsState[index] = updated;
    return updated;
  }

  const { data } = await api.post<Post>(`/posts/${postId}/vote`);
  return data;
}

export async function ratePost(postId: string, score: number): Promise<Post> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 150));
    const index = mockPostsState.findIndex((p) => p.id === postId);
    if (index === -1) throw new Error("Post no encontrado");

    const post = mockPostsState[index];
    const hadRatedBefore = post.currentUserRating !== undefined;
    const newRatingsCount = hadRatedBefore ? post.ratingsCount : post.ratingsCount + 1;
    const totalBefore = post.averageRating * post.ratingsCount;
    const totalAfter = hadRatedBefore
      ? totalBefore - post.currentUserRating! + score
      : totalBefore + score;

    const updated: Post = {
      ...post,
      currentUserRating: score,
      ratingsCount: newRatingsCount,
      averageRating: Number((totalAfter / newRatingsCount).toFixed(1)),
    };

    mockPostsState[index] = updated;
    return updated;
  }

  const { data } = await api.put<Post>(`/posts/${postId}/rating`, { score });
  return data;
}
export async function unratePost(postId: string): Promise<Post> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 150));
    const index = mockPostsState.findIndex((p) => p.id === postId);
    if (index === -1) throw new Error("Post no encontrado");

    const post = mockPostsState[index];
    if (post.currentUserRating === undefined) return post; // no había puntuado

    const newRatingsCount = Math.max(post.ratingsCount - 1, 0);
    const totalBefore = post.averageRating * post.ratingsCount;
    const totalAfter = totalBefore - post.currentUserRating;
    const newAverage = newRatingsCount > 0 ? totalAfter / newRatingsCount : 0;

    const updated: Post = {
      ...post,
      currentUserRating: undefined,
      ratingsCount: newRatingsCount,
      averageRating: Number(newAverage.toFixed(1)),
    };

    mockPostsState[index] = updated;
    return updated;
  }

  // BACKEND: se espera que el endpoint elimine el rating del usuario y devuelva el post actualizado
  const { data } = await api.delete<Post>(`/posts/${postId}/rating`);
  return data;
}