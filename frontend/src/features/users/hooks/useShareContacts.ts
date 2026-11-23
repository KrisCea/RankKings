import { useQuery } from "@tanstack/react-query";
import { getShareContacts } from "../api";

export function useShareContacts() {
  return useQuery({
    queryKey: ["shareContacts"],
    queryFn: getShareContacts,
  });
}