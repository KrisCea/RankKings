export interface Comment {
  id: string;
  postId: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string;
  };
  text: string;
  likesCount: number;
  likedByCurrentUser: boolean;
  createdAt: string;
}