import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleCommentLike } from "../api";
import type { Comment } from "../../../types/comment";

export function useToggleCommentLike(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => toggleCommentLike(commentId),

    onSuccess: (updatedComment: Comment) => {
      queryClient.setQueryData<Comment[]>(["comments", postId], (old) =>
        old?.map((c) => (c.id === updatedComment.id ? updatedComment : c))
      );
    },
  });
}