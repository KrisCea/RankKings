import { useState } from "react";
import { usePosts } from "../../features/posts/hooks/usePosts";
import { useToggleVote } from "../../features/posts/hooks/useToggleVote";
import { useRatePost } from "../../features/posts/hooks/useRatePost";
import { useUnratePost } from "../../features/posts/hooks/useUnratePost";
import PostCard from "../../features/posts/components/PostCard";
import ViewTabs from "../../features/posts/components/ViewTabs";
import FeaturedCarousel from "../../features/posts/components/FeaturedCarousel";
import CommentsPanel from "../../features/comments/components/CommentsPanel";
import type { FeedViewMode } from "../../types/view";

export default function Home() {
  const [viewMode, setViewMode] = useState<FeedViewMode>("posts");
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);

  const { data: posts, isLoading } = usePosts();
  const toggleVote = useToggleVote();
  const ratePost = useRatePost();
  const unratePost = useUnratePost();

  return (
    <div className="max-w-xl mx-auto">
      <FeaturedCarousel />

      <ViewTabs active={viewMode} onChange={setViewMode} />

      {viewMode === "posts" && (
        <>
          {isLoading && <p className="text-foreground/60">Cargando...</p>}
          {posts?.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onToggleVote={(id) => toggleVote.mutate(id)}
              onRate={(id, score) => ratePost.mutate({ postId: id, score })}
              onUnrate={(id) => unratePost.mutate(id)}
              onOpenComments={(id) => setActiveCommentsPostId(id)}
              onOpenShare={(id) => console.log("share", id)}
            />
          ))}
        </>
      )}

      {viewMode === "reels" && (
        <p className="text-foreground/60 text-center py-12">Vista de Reels — próximamente</p>
      )}

      {viewMode === "gallery" && (
        <p className="text-foreground/60 text-center py-12">Vista de Galería — próximamente</p>
      )}

      <CommentsPanel
        postId={activeCommentsPostId}
        onClose={() => setActiveCommentsPostId(null)}
      />
    </div>
  );
}