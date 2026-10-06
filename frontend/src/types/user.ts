export type UserRole = "user" | "admin";
export type AccountType = "individual" | "business";

export interface UserSummary {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  accountType: AccountType;
  isVerifiedBusiness?: boolean;
}

export interface User extends UserSummary {
  isAuthenticated: boolean;
  role: UserRole;
}

export interface UserProfile extends UserSummary {
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowedByCurrentUser: boolean;
}