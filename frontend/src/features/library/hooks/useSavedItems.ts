import { useQuery } from "@tanstack/react-query";
import { getSavedItems } from "../api";

export function useSavedItems(enabled: boolean) {
  return useQuery({
    queryKey: ["savedItems"],
    queryFn: getSavedItems,
    enabled,
  });
}