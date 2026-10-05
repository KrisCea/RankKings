import type { User, UserSummary } from "../types/user";

export const mockCurrentUser: User = {
  id: "1",
  username: "cris",
  displayName: "Cristóbal",
  avatarUrl: "https://ui-avatars.com/api/?name=Cristobal&background=6366f1&color=fff",
  accountType: "individual",
  isAuthenticated: true,
  role: "user",
};

export const mockUsers: UserSummary[] = [
  {
    id: "2",
    username: "ana_reviews",
    displayName: "Ana Torres",
    avatarUrl: "https://ui-avatars.com/api/?name=Ana+Torres&background=e11d48&color=fff",
    accountType: "individual",
  },
  {
    id: "3",
    username: "sonymusic",
    displayName: "Sony Music",
    avatarUrl: "https://ui-avatars.com/api/?name=Sony+Music&background=16a34a&color=fff",
    accountType: "business",
    isVerifiedBusiness: true,
  },
  {
    id: "4",
    username: "pedro_libros",
    displayName: "Pedro Ramírez",
    avatarUrl: "https://ui-avatars.com/api/?name=Pedro+Ramirez&background=7c3aed&color=fff",
    accountType: "individual",
  },
];