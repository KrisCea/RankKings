import { useQuery } from "@tanstack/react-query";
import { getItemChildren } from "../api";

export function useItemChildren(itemId: string | undefined) {
  return useQuery({
    queryKey: ["itemChildren", itemId],
    queryFn: () => getItemChildren(itemId as string),
    enabled: itemId !== undefined,
  });
}