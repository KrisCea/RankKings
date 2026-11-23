import { useMutation } from "@tanstack/react-query";
import { verifyEmail } from "../api";

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => verifyEmail(token),
  });
}