import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleCommentLike } from "../api";
import type { Comment, Review } from "../../../types/comment";

export function useToggleCommentLike(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => toggleCommentLike(commentId),

    onSuccess: (updatedComment: Comment) => {
      queryClient.setQueryData<Comment[]>(["comments", postId], (old) =>
        old?.map((c) => (c.id === updatedComment.id ? updatedComment : c))
      );
      if (updatedComment.kind === "review") {
        const updatedReview: Review = { ...updatedComment, kind: "review" };
        queryClient.setQueriesData<Review[]>({ queryKey: ["itemReviews"] }, (old) =>
          old?.map((review) => (review.id === updatedReview.id ? updatedReview : review))
        );
        queryClient.setQueriesData<Review[]>(
          {
            predicate: (query) =>
              query.queryKey[0] === "userPosts" && query.queryKey[2] === "review",
          },
          (old) => old?.map((review) => (review.id === updatedReview.id ? updatedReview : review))
        );
      }
    },
  });
}