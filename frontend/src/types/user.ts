export type UserRole = "user" | "admin";
export type AccountType = "individual" | "business";
export type AccountVerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface UserSummary {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  accountType: AccountType;
  isVerified: boolean;
}

export interface User extends UserSummary {
  isAuthenticated: boolean;
  role: UserRole;
  verificationStatus: AccountVerificationStatus;
  verificationReviewReason: string | null;
}

export interface UserProfile extends UserSummary {
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowedByCurrentUser: boolean;
}