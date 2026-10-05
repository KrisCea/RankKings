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

export interface Post {
  id: string;
  category: CategoryId;
  author: UserSummary;
  caption: string;
  media: PostMedia[];
  rankableItem: RankableItem;

  votesCount: number;
  votedByCurrentUser: boolean;

  averageRating: number;
  ratingsCount: number;
  currentUserRating?: number;

  commentsCount: number;
  sharesCount: number;

  moderationStatus: ModerationStatus;
  createdAt: string;
  isReelEligible: boolean;
}