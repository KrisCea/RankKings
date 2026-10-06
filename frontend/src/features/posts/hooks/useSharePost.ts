import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sharePost } from "../api";
import type { Post } from "../../../types/post";

interface ShareParams {
  postId: string;
  recipientId: string;
}

export function useSharePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, recipientId }: ShareParams) => sharePost(postId, recipientId),

    onSuccess: (updatedPost: Post) => {
      queryClient.setQueryData<Post[]>(["posts"], (old) =>
        old?.map((post) => (post.id === updatedPost.id ? updatedPost : post))
      );
    },
  });
}