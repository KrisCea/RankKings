import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleVote } from "../api";
import type { Post } from "../../../types/post";

export function useToggleVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => toggleVote(postId),

    onSuccess: (updatedPost: Post) => {
      queryClient.setQueryData<Post[]>(["posts"], (old) =>
        old?.map((post) => (post.id === updatedPost.id ? updatedPost : post))
      );
    },
  });
}