import type { QueryClient } from "@tanstack/react-query";
import type { Post } from "../../types/post";
import type { RankableItem } from "../../types/rankableItem";

export function syncPostInCache(queryClient: QueryClient, updated: Post) {
  const replace = (list?: Post[]) => list?.map((p) => (p.id === updated.id ? updated : p));

  queryClient.setQueryData<Post[]>(["posts"], replace);
  queryClient.setQueriesData<Post[]>({ queryKey: ["itemReviews"] }, replace);
  queryClient.setQueryData<Post>(["post", updated.id], updated);

  // La puntuación de un post de ítem es la del propio ítem: mantiene su ficha sincronizada
  if (updated.kind === "item") {
    queryClient.setQueryData<RankableItem>(["item", updated.rankableItem.id], (old) =>
      old
        ? { ...old, averageRating: updated.averageRating, ratingsCount: updated.ratingsCount }
        : old
    );
  }
}