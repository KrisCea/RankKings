import type { CategoryId } from "../constants/categories";
import type { UserSummary } from "./user";
import type { RankableItem } from "./rankableItem";

export type MediaType = "image" | "video";

export interface PostMedia {
  id: string;
  url: string;
  type: MediaType;
  thumbnailUrl?: string;
}

export type ModerationStatus = "approved" | "pending" | "rejected";

// "item": publicación nueva de un RankableItem. "review": reseña de un usuario sobre un ítem existente.
export type PostKind = "item" | "review";

export interface PostReview {
  authorScore: number; // 1.0 a 10.0: la nota que el autor le pone al ítem
}

export interface Post {
  id: string;
  kind: PostKind;
  category: CategoryId;
  author: UserSummary;
  caption: string; // descripción de la publicación, o el texto de la reseña
  media: PostMedia[];
  rankableItem: RankableItem;
  review?: PostReview; // solo cuando kind === "review"

  votesCount: number;
  votedByCurrentUser: boolean;

  // Lo que puntúa el slider: en "item" es la nota del ítem, en "review" es la utilidad de la reseña.
  averageRating: number;
  ratingsCount: number;
  currentUserRating?: number;

  commentsCount: number;
  sharesCount: number;

  moderationStatus: ModerationStatus;
  createdAt: string;
  isReelEligible: boolean;
}