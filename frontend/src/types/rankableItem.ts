import type { CategoryId } from "../constants/categories";
import type { Creator } from "./creator";

export type VerificationStatus = "verified" | "partial" | "unverified";

export interface RankableItem {
  id: string;
  category: CategoryId;
  title: string;
  creator: Creator;
  uploadedBy: string;
  year?: number;
  coverUrl: string;
  identifiers: Record<string, string>;
  verificationStatus: VerificationStatus;
  createdAt: string;
}