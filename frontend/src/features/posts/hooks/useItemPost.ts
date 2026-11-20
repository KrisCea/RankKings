import { useQuery } from "@tanstack/react-query";
import { getItemPost } from "../api";

export function useItemPost(itemId: string | undefined) {
  return useQuery({
    queryKey: ["itemPost", itemId],
    queryFn: () => getItemPost(itemId as string),
    enabled: itemId !== undefined,
    retry: false,
  });
}
