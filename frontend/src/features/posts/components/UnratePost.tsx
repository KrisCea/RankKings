import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unratePost } from "../api";
import type { Post } from "../../../types/post";

export function useUnratePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => unratePost(postId),

    onSuccess: (updatedPost: Post) => {
      queryClient.setQueryData<Post[]>(["posts"], (old) =>
        old?.map((post) => (post.id === updatedPost.id ? updatedPost : post))
      );
    },
  });
}