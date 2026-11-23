import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unratePost } from "../api";
import { syncPostInCache } from "../cache";

export function useUnratePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => unratePost(postId),
    onSuccess: (updatedPost) => syncPostInCache(queryClient, updatedPost),
  });
}