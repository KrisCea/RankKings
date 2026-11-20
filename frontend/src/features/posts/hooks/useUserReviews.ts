import { useQuery } from "@tanstack/react-query";
import { getReviewsByAuthor } from "../api";

export function useUserReviews(username: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["userPosts", username, "review"],
    queryFn: () => getReviewsByAuthor(username as string),
    enabled: username !== undefined && enabled,
  });
}
