import { useQuery } from "@tanstack/react-query";
import { getPostById } from "../api";

export function usePost(postId: string | undefined) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId as string),
    enabled: postId !== undefined,
    retry: false, // si el post no existe, no reintentar: se muestra "no encontrado" de inmediato
  });
}