import { api } from "../../lib/axios";
import { mockPosts as initialMockPosts } from "../../mocks/posts";
import { getMockSessionUser, requireMockSession } from "../../mocks/accounts";
import { withSavedState } from "../../mocks/savedItems";
import type { Post, PostKind } from "../../types/post";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

// MOCK: estado mutable en memoria, simula una base de datos mientras no hay backend.
// Se pierde al recargar la página. El backend real reemplazará esto con persistencia de verdad.
let mockPostsState: Post[] = [...initialMockPosts];

// MOCK: los ítems hijos (canciones, capítulos) no se publican por separado en el feed,
// solo su colección. El backend decidirá qué posts entran al feed.
function isFeedVisible(post: Post): boolean {
  return !(post.kind === "item" && post.rankableItem.parentId);
}

// MOCK: agrega lo que depende de quién consulta (el backend lo resuelve con la sesión):
// el estado de la lista del ítem y, para un visitante, que no tiene votos ni puntuaciones propias.
function forViewer(post: Post): Post {
  const rankableItem = withSavedState(post.rankableItem);
  if (getMockSessionUser()) return { ...post, rankableItem };
  return { ...post, rankableItem, votedByCurrentUser: false, currentUserRating: undefined };
}

export async function getPosts(): Promise<Post[]> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 300));
    return mockPostsState.filter(isFeedVisible).map(forViewer);
  }

  const { data } = await api.get<Post[]>("/posts");
  return data;
}

export async function getFeaturedPosts(): Promise<Post[]> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 300));
    // MOCK: destacado = ítems nuevos (nunca reseñas ni hijos), ordenados por puntuación.
    return mockPostsState
      .filter((p) => p.kind === "item" && isFeedVisible(p))
      .sort((a, b) => b.averageRating - a.averageRating)
      .map(forViewer);
  }

  // BACKEND: solo posts de tipo "item", en el orden que decida el algoritmo de destacados.
  const { data } = await api.get<Post[]>("/posts/featured");
  return data;
}

export async function getPostById(postId: string): Promise<Post> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 200));
    const post = mockPostsState.find((p) => p.id === postId);
    if (!post) throw new Error("Post no encontrado");
    return forViewer(post);
  }

  const { data } = await api.get<Post>(`/posts/${postId}`);
  return data;
}

export async function getReviewsForItem(itemId: string): Promise<Post[]> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 200));
    return mockPostsState
      .filter((p) => p.kind === "review" && p.rankableItem.id === itemId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(forViewer);
  }

  // BACKEND: reseñas de un ítem, ordenadas con el criterio del servidor (recientes, mejor valoradas...)
  const { data } = await api.get<Post[]>(`/items/${itemId}/reviews`);
  return data;
}

export async function toggleVote(postId: string): Promise<Post> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 150));
    requireMockSession();

    const index = mockPostsState.findIndex((p) => p.id === postId);
    if (index === -1) throw new Error("Post no encontrado");

    const post = mockPostsState[index];
    const updated: Post = {
      ...post,
      votedByCurrentUser: !post.votedByCurrentUser,
      votesCount: post.votedByCurrentUser ? post.votesCount - 1 : post.votesCount + 1,
    };

    mockPostsState[index] = updated;
    return forViewer(updated);
  }

  // BACKEND: alterna el voto del usuario de la sesión y devuelve el post actualizado.
  // Sin sesión: 401.
  const { data } = await api.post<Post>(`/posts/${postId}/vote`);
  return data;
}

export async function ratePost(postId: string, score: number): Promise<Post> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 150));
    requireMockSession();

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
    return forViewer(updated);
  }

  // BACKEND: guarda o actualiza la puntuación del usuario de la sesión y devuelve el post con el
  // promedio ya recalculado. Sin sesión: 401.
  const { data } = await api.put<Post>(`/posts/${postId}/rating`, { score });
  return data;
}

export async function unratePost(postId: string): Promise<Post> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 150));
    requireMockSession();

    const index = mockPostsState.findIndex((p) => p.id === postId);
    if (index === -1) throw new Error("Post no encontrado");

    const post = mockPostsState[index];
    if (post.currentUserRating === undefined) return forViewer(post); // no había puntuado

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
    return forViewer(updated);
  }

  // BACKEND: elimina la puntuación del usuario de la sesión y devuelve el post actualizado.
  // Sin sesión: 401.
  const { data } = await api.delete<Post>(`/posts/${postId}/rating`);
  return data;
}

export async function sharePost(postId: string, recipientId: string): Promise<Post> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 150));
    requireMockSession();

    const index = mockPostsState.findIndex((p) => p.id === postId);
    if (index === -1) throw new Error("Post no encontrado");

    const updated: Post = {
      ...mockPostsState[index],
      sharesCount: mockPostsState[index].sharesCount + 1,
    };

    mockPostsState[index] = updated;
    return forViewer(updated);
  }

  // BACKEND: envía el post al destinatario (p. ej. como mensaje de chat) y devuelve el post
  // con sharesCount actualizado. Sin sesión: 401.
  const { data } = await api.post<Post>(`/posts/${postId}/share`, { recipientId });
  return data;
}

export async function getPostsByAuthor(username: string, kind: PostKind): Promise<Post[]> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 250));
    return mockPostsState
      .filter((p) => p.author.username === username && p.kind === kind && isFeedVisible(p))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(forViewer);
  }

  // BACKEND: GET /users/:username/posts?kind=item|review, más recientes primero.
  // Con paginación por cursor cuando haya volumen.
  const { data } = await api.get<Post[]>(`/users/${username}/posts`, { params: { kind } });
  return data;
}