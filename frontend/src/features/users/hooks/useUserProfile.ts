import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../api";

export function useUserProfile(username: string | null) {
  return useQuery({
    queryKey: ["userProfile", username],
    queryFn: () => getUserProfile(username as string),
    enabled: username !== null,
  });
}