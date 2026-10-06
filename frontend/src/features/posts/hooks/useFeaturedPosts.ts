import { useQuery } from "@tanstack/react-query";
import { getFeaturedPosts } from "../api";

export function useFeaturedPosts() {
  return useQuery({
    queryKey: ["featuredPosts"],
    queryFn: getFeaturedPosts,
  });
}