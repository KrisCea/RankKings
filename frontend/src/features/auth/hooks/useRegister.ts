import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../api";
import type { RegisterInput } from "../../../types/auth";

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => registerUser(input),
  });
}