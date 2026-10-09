import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { mockPosts } from "../../mocks/posts";
import { syncPostInCache } from "./cache";
import type { Post } from "../../types/post";
import type { RankableItem } from "../../types/rankableItem";

describe("syncPostInCache", () => {
  it("propaga un post actualizado al feed, al perfil, a su página y a su ítem", () => {
    const queryClient = new QueryClient();
    const original = mockPosts[0]; // publicación de ítem (Oppenheimer)
    const other = mockPosts[1];

    queryClient.setQueryData<Post[]>(["posts"], [original, other]);
    queryClient.setQueryData<Post[]>(["userPosts", "ana_reviews", "item"], [original]);
    queryClient.setQueryData<Post>(["post", original.id], original);
    queryClient.setQueryData<RankableItem>(
      ["item", original.rankableItem.id],
      original.rankableItem
    );

    const updated: Post = { ...original, votesCount: 999, averageRating: 5.5, ratingsCount: 3 };
    syncPostInCache(queryClient, updated);

    // Se actualiza en todas las listas donde aparece, sin tocar los demás posts
    expect(queryClient.getQueryData<Post[]>(["posts"])).toEqual([updated, other]);
    expect(queryClient.getQueryData<Post[]>(["userPosts", "ana_reviews", "item"])).toEqual([
      updated,
    ]);
    expect(queryClient.getQueryData<Post>(["post", original.id])).toEqual(updated);

    // La puntuación de una publicación de ítem es la del propio ítem
    const item = queryClient.getQueryData<RankableItem>(["item", original.rankableItem.id]);
    expect(item?.averageRating).toBe(5.5);
    expect(item?.ratingsCount).toBe(3);

    queryClient.clear();
  });
});