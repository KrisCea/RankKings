import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleFollow } from "../api";
import type { UserProfile } from "../../../types/user";

export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) => toggleFollow(username),

    onSuccess: (updatedProfile: UserProfile) => {
      // Actualiza la caché del perfil: la vista previa y la página de perfil comparten esta clave
      queryClient.setQueryData(["userProfile", updatedProfile.username], updatedProfile);
    },
  });
}