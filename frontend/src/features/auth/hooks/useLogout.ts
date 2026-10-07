import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../api";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),

    onSuccess: async () => {
      queryClient.setQueryData(["currentUser"], null);
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== "currentUser",
      });
    },
  });
}