import { useState } from "react";
import { usePosts } from "../../features/posts/hooks/usePosts";
import { useToggleVote } from "../../features/posts/hooks/useToggleVote";
import { useRatePost } from "../../features/posts/hooks/useRatePost";
import { useUnratePost } from "../../features/posts/hooks/useUnratePost";
import { useRequireAuth } from "../../features/auth/hooks/useRequireAuth";
import { useCenterFocus } from "../../hooks/useCenterFocus";
import PostCard from "../../features/posts/components/PostCard";
import ViewTabs from "../../features/posts/components/ViewTabs";
import FeaturedCarousel from "../../features/posts/components/FeaturedCarousel";
import GalleryView from "../../features/posts/components/GalleryView";
import CommentsPanel from "../../features/comments/components/CommentsPanel";
import SharePanel from "../../features/share/components/SharePanel";
import Modal from "../../components/ui/Modal";
import type { FeedViewMode } from "../../types/view";

export default function Home() {
  const [viewMode, setViewMode] = useState<FeedViewMode>("posts");
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [activeSharePostId, setActiveSharePostId] = useState<string | null>(null);
  const [galleryPostId, setGalleryPostId] = useState<string | null>(null);

  const { data: posts, isLoading } = usePosts();
  const toggleVote = useToggleVote();
  const ratePost = useRatePost();
  const unratePost = useUnratePost();
  const requireAuth = useRequireAuth();

  // El post que cruza el centro de la pantalla se expande; el resto queda en formato cine
  const { containerRef, focusedId } = useCenterFocus(
    (posts ?? []).map((p) => p.id),
    viewMode === "posts"
  );

  // Se busca en la lista cacheada para que el modal refleje votos y puntuaciones en vivo
  const galleryPost = posts?.find((p) => p.id === galleryPostId);

  const postHandlers = {
    onToggleVote: requireAuth((id: string) => toggleVote.mutate(id)),
    onRate: requireAuth((id: string, score: number) => ratePost.mutate({ postId: id, score })),
    onUnrate: requireAuth((id: string) => unratePost.mutate(id)),
    onOpenComments: (id: string) => setActiveCommentsPostId(id), // leer comentarios es libre
    onOpenShare: requireAuth((id: string) => setActiveSharePostId(id)),
  };

  return (
    <div className="w-full">
      <FeaturedCarousel />

      <ViewTabs active={viewMode} onChange={setViewMode} />

      {viewMode === "posts" && (
        <div
          ref={containerRef}
          // La compensación de scroll la hace useCenterFocus; el anclaje nativo del navegador
          // se desactiva para que no compense dos veces
          style={{ overflowAnchor: "none" }}
          className="mx-auto w-full max-w-2xl lg:max-w-3xl 2xl:max-w-4xl"
        >
          {isLoading && <p className="text-foreground/60">Cargando...</p>}
          {posts?.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              focused={post.id === focusedId}
              {...postHandlers}
            />
          ))}
        </div>
      )}

      {viewMode === "reels" && (
        <p className="text-foreground/60 text-center py-12">Vista de Reels — próximamente</p>
      )}

      {viewMode === "gallery" && (
        <GalleryView
          posts={posts ?? []}
          isLoading={isLoading}
          onSelectPost={setGalleryPostId}
        />
      )}

      {/* Orden importa: los paneles que se abren desde el modal van después, para quedar encima */}
      <Modal
        open={galleryPost !== undefined}
        title={galleryPost?.rankableItem.title ?? ""}
        onClose={() => setGalleryPostId(null)}
      >
        {galleryPost && (
          <div className="flex-1 overflow-y-auto p-4">
            <PostCard post={galleryPost} {...postHandlers} />
          </div>
        )}
      </Modal>

      <CommentsPanel
        postId={activeCommentsPostId}
        onClose={() => setActiveCommentsPostId(null)}
      />

      <SharePanel
        postId={activeSharePostId}
        onClose={() => setActiveSharePostId(null)}
      />
    </div>
  );
}