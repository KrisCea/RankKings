import { useState } from "react";
import PostCard from "./PostCard";
import CommentsPanel from "../../comments/components/CommentsPanel";
import SharePanel from "../../share/components/SharePanel";
import { useToggleVote } from "../hooks/useToggleVote";
import { useRatePost } from "../hooks/useRatePost";
import { useUnratePost } from "../hooks/useUnratePost";
import { useRequireAuth } from "../../auth/hooks/useRequireAuth";
import { useCenterFocus } from "../../../hooks/useCenterFocus";
import type { Post } from "../../../types/post";

interface PostListProps {
  posts: Post[];
  isLoading: boolean;
  emptyMessage: string;
}

// Feed vertical con todo lo necesario para interactuar: foco centrado, votos, puntuación,
// comentarios y compartir. Pensado para reutilizarse (perfil, páginas por categoría).
export default function PostList({ posts, isLoading, emptyMessage }: PostListProps) {
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);
  const [sharePostId, setSharePostId] = useState<string | null>(null);

  const toggleVote = useToggleVote();
  const ratePost = useRatePost();
  const unratePost = useUnratePost();
  const requireAuth = useRequireAuth();

  const { containerRef, focusedId } = useCenterFocus(posts.map((p) => p.id));

  const handlers = {
    onToggleVote: requireAuth((id: string) => toggleVote.mutate(id)),
    onRate: requireAuth((id: string, score: number) => ratePost.mutate({ postId: id, score })),
    onUnrate: requireAuth((id: string) => unratePost.mutate(id)),
    onOpenComments: (id: string) => setCommentsPostId(id), // leer comentarios es libre
    onOpenShare: requireAuth((id: string) => setSharePostId(id)),
  };

  return (
    <>
      <div
        ref={containerRef}
        // La compensación de scroll la hace useCenterFocus; se desactiva el anclaje nativo
        style={{ overflowAnchor: "none" }}
        className="mx-auto w-full max-w-2xl lg:max-w-3xl 2xl:max-w-4xl"
      >
        {isLoading && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <p className="py-12 text-center text-sm text-foreground/50">{emptyMessage}</p>
        )}

        {posts.map((post) => (
          <PostCard key={post.id} post={post} focused={post.id === focusedId} {...handlers} />
        ))}
      </div>

      <CommentsPanel postId={commentsPostId} onClose={() => setCommentsPostId(null)} />
      <SharePanel postId={sharePostId} onClose={() => setSharePostId(null)} />
    </>
  );
}