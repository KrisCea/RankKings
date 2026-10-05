import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ratePost } from "../api";
import type { Post } from "../../../types/post";

interface RateParams {
  postId: string;
  score: number;
}

export function useRatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, score }: RateParams) => ratePost(postId, score),

    onSuccess: (updatedPost: Post) => {
      queryClient.setQueryData<Post[]>(["posts"], (old) =>
        old?.map((post) => (post.id === updatedPost.id ? updatedPost : post))
      );
    },
  });
}