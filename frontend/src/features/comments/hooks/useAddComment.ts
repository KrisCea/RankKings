import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addComment } from "../api";
import type { Comment, NewCommentInput } from "../../../types/comment";
import type { Post } from "../../../types/post";

export function useAddComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NewCommentInput) => addComment(postId, input),

    onSuccess: (newComment: Comment) => {
      queryClient.setQueryData<Comment[]>(["comments", postId], (old) =>
        old ? [...old, newComment] : [newComment]
      );

      // Las respuestas también cuentan en el total de comentarios del post
      queryClient.setQueryData<Post[]>(["posts"], (old) =>
        old?.map((post) =>
          post.id === postId ? { ...post, commentsCount: post.commentsCount + 1 } : post
        )
      );
    },
  });
}