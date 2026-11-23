import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ratePost } from "../api";
import { syncPostInCache } from "../cache";

interface RateParams {
  postId: string;
  score: number;
}

export function useRatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, score }: RateParams) => ratePost(postId, score),
    onSuccess: (updatedPost) => syncPostInCache(queryClient, updatedPost),
  });
}