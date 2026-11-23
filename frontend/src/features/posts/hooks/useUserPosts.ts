import { useQuery } from "@tanstack/react-query";
import { getPostsByAuthor } from "../api";

export function useUserPosts(username: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["userPosts", username, "item"],
    queryFn: () => getPostsByAuthor(username as string),
    enabled: username !== undefined && enabled,
  });
}