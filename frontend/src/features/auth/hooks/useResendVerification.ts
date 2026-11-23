import { useMutation } from "@tanstack/react-query";
import { resendVerification } from "../api";

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => resendVerification(email),
  });
}