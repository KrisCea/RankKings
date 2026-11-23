import { useQuery } from "@tanstack/react-query";
import { getItemById } from "../api";

export function useItem(itemId: string | undefined) {
  return useQuery({
    queryKey: ["item", itemId],
    queryFn: () => getItemById(itemId as string),
    enabled: itemId !== undefined,
    retry: false,
  });
}