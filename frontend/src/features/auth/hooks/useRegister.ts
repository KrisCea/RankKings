import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerUser } from "../api";
import type { RegisterInput } from "../../../types/auth";

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterInput) => registerUser(input),

    onSuccess: async (user) => {
      queryClient.setQueryData(["currentUser"], user);
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== "currentUser",
      });
    },
  });
}