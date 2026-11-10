import { api } from "../../lib/axios";
import type { Post, PostKind } from "../../types/post";

export async function getPosts(): Promise<Post[]> {
  const { data } = await api.get<Post[]>("/posts");
  return data;
}

export async function getFeaturedPosts(): Promise<Post[]> {
  const { data } = await api.get<Post[]>("/posts/featured");
  return data;
}

export async function getPostById(postId: string): Promise<Post> {
  const { data } = await api.get<Post>(`/posts/${postId}`);
  return data;
}

export async function getReviewsForItem(itemId: string): Promise<Post[]> {
  const { data } = await api.get<Post[]>(`/items/${itemId}/reviews`);
  return data;
}

export async function toggleVote(postId: string): Promise<Post> {
  const { data } = await api.post<Post>(`/posts/${postId}/vote`);
  return data;
}

export async function ratePost(postId: string, score: number): Promise<Post> {
  const { data } = await api.put<Post>(`/posts/${postId}/rating`, { score });
  return data;
}

export async function unratePost(postId: string): Promise<Post> {
  const { data } = await api.delete<Post>(`/posts/${postId}/rating`);
  return data;
}

export async function sharePost(postId: string, recipientId: string): Promise<Post> {
  const { data } = await api.post<Post>(`/posts/${postId}/share`, { recipientId });
  return data;
}

export async function getPostsByAuthor(username: string, kind: PostKind): Promise<Post[]> {
  const { data } = await api.get<Post[]>(`/users/${username}/posts`, { params: { kind } });
  return data;
}

export interface NewPostInput {
  itemId: string;
  kind: "item" | "review";
  caption: string;
  authorScore?: number;
}

export async function createPost(input: NewPostInput): Promise<Post> {
  const { data } = await api.post<Post>("/posts", input);
  return data;
}