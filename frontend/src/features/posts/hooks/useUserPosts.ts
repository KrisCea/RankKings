import { useQuery } from "@tanstack/react-query";
import { getPostsByAuthor } from "../api";
import type { PostKind } from "../../../types/post";

export function useUserPosts(username: string | undefined, kind: PostKind) {
  return useQuery({
    queryKey: ["userPosts", username, kind],
    queryFn: () => getPostsByAuthor(username as string, kind),
    enabled: username !== undefined,
  });
}