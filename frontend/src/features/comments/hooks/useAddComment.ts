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
      const addOne = (post: Post): Post => ({ ...post, commentsCount: post.commentsCount + 1 });
      const patch = (list?: Post[]) =>
        list?.map((post) => (post.id === postId ? addOne(post) : post));

      queryClient.setQueryData<Post[]>(["posts"], patch);
      queryClient.setQueryData<Post[]>(["featuredPosts"], patch);
      queryClient.setQueriesData<Post[]>({ queryKey: ["itemReviews"] }, patch);
      queryClient.setQueriesData<Post[]>({ queryKey: ["userPosts"] }, patch);
      queryClient.setQueryData<Post>(["post", postId], (old) => (old ? addOne(old) : old));
    },
  });
}