import type { QueryClient } from "@tanstack/react-query";
import type { Post } from "../../types/post";
import type { RankableItem } from "../../types/rankableItem";

// Propaga el estado de la lista de un ítem a todas las cachés donde aparece
export function syncItemInCache(queryClient: QueryClient, updated: RankableItem) {
  const patchItem = (item: RankableItem): RankableItem =>
    item.id === updated.id
      ? { ...item, savedByCurrentUser: updated.savedByCurrentUser, savesCount: updated.savesCount }
      : item;

  const patchPost = (post: Post): Post =>
    post.rankableItem.id === updated.id
      ? { ...post, rankableItem: patchItem(post.rankableItem) }
      : post;

  queryClient.setQueryData<RankableItem>(["item", updated.id], (old) =>
    old ? patchItem(old) : old
  );
  queryClient.setQueriesData<RankableItem[]>({ queryKey: ["itemChildren"] }, (old) =>
    old?.map(patchItem)
  );
  queryClient.setQueriesData<Post[]>({ queryKey: ["userPosts"] }, (old) => old?.map(patchPost));
  queryClient.setQueryData<Post[]>(["posts"], (old) => old?.map(patchPost));
  queryClient.setQueryData<Post[]>(["featuredPosts"], (old) => old?.map(patchPost));
  queryClient.setQueriesData<Post[]>({ queryKey: ["itemReviews"] }, (old) =>
    old?.map(patchPost)
  );
  queryClient.setQueriesData<Post>({ queryKey: ["post"] }, (old) =>
    old ? patchPost(old) : old
  );
}