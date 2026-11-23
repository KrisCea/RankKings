import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleVote } from "../api";
import { syncPostInCache } from "../cache";

export function useToggleVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => toggleVote(postId),
    onSuccess: (updatedPost) => syncPostInCache(queryClient, updatedPost),
  });
}