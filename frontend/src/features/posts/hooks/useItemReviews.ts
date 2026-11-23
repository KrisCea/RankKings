import { useQuery } from "@tanstack/react-query";
import { getReviewsForItem } from "../api";

export function useItemReviews(itemId: string | undefined) {
  return useQuery({
    queryKey: ["itemReviews", itemId],
    queryFn: () => getReviewsForItem(itemId as string),
    enabled: itemId !== undefined,
  });
}