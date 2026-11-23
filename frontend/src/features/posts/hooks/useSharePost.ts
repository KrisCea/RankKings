import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sharePost } from "../api";
import { syncPostInCache } from "../cache";

interface ShareParams {
  postId: string;
  recipientId: string;
}

export function useSharePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, recipientId }: ShareParams) => sharePost(postId, recipientId),
    onSuccess: (updatedPost) => syncPostInCache(queryClient, updatedPost),
  });
}