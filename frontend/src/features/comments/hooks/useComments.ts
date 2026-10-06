import { useQuery } from "@tanstack/react-query";
import { getComments } from "../api";

export function useComments(postId: string | null) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getComments(postId as string),
    enabled: postId !== null,
  });
}