import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../api";
import type { LoginInput } from "../../../types/auth";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),

    onSuccess: async (user) => {
      queryClient.setQueryData(["currentUser"], user);
      // Todo lo personal (votos, puntuaciones, seguidos...) cambia con la sesión: se vuelve a pedir
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== "currentUser",
      });
    },
  });
}