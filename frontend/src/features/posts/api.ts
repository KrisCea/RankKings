import { api } from "../../lib/axios";
import type { Review } from "../../types/comment";
import type { Post } from "../../types/post";

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

export async function getReviewsForItem(itemId: string): Promise<Review[]> {
  const { data } = await api.get<Review[]>(`/items/${encodeURIComponent(itemId)}/reviews`);
  return data;
}

export async function getItemPost(itemId: string): Promise<Post> {
  const { data } = await api.get<Post>(`/posts/by-item/${encodeURIComponent(itemId)}`);
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

export async function getPostsByAuthor(username: string): Promise<Post[]> {
  const { data } = await api.get<Post[]>(`/users/${encodeURIComponent(username)}/posts`, {
    params: { kind: "item" },
  });
  return data;
}

export async function getReviewsByAuthor(username: string): Promise<Review[]> {
  const { data } = await api.get<Review[]>(`/users/${encodeURIComponent(username)}/posts`, {
    params: { kind: "review" },
  });
  return data;
}

export async function addReview(
  postId: string,
  input: { text: string; authorScore?: number }
): Promise<Review> {
  const { data } = await api.post<Review>(`/posts/${encodeURIComponent(postId)}/reviews`, input);
  return data;
}

export interface ImageUploadUrl {
  mediaId: string;
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
  expiresAt: string;
}

export async function uploadPostImage(postId: string, file: File): Promise<void> {
  const { data: upload } = await api.post<ImageUploadUrl>(
    `/posts/${encodeURIComponent(postId)}/media/uploads`,
    { contentType: file.type, sizeBytes: file.size }
  );
  const response = await fetch(upload.uploadUrl, {
    method: upload.method,
    headers: upload.headers,
    body: file,
  });
  if (!response.ok) {
    throw new Error(`S3 rechazó la carga de la imagen (HTTP ${response.status}).`);
  }
  await api.post(
    `/posts/${encodeURIComponent(postId)}/media/${encodeURIComponent(upload.mediaId)}/complete`
  );
}

export async function addExternalMedia(
  postId: string,
  input: { url: string; type: "video" | "external" }
): Promise<void> {
  await api.post(`/posts/${encodeURIComponent(postId)}/media/external`, input);
}

export interface NewPostInput {
  itemId: string;
  kind: "item";
  caption: string;
}

export async function createPost(input: NewPostInput): Promise<Post> {
  const { data } = await api.post<Post>("/posts", input);
  return data;
}