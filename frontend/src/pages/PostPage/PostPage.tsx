import { useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PostCard from "../../features/posts/components/PostCard";
import CommentsPanel from "../../features/comments/components/CommentsPanel";
import SharePanel from "../../features/share/components/SharePanel";
import { usePost } from "../../features/posts/hooks/usePost";
import { useToggleVote } from "../../features/posts/hooks/useToggleVote";
import { useRatePost } from "../../features/posts/hooks/useRatePost";
import { useUnratePost } from "../../features/posts/hooks/useUnratePost";

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const { data: post, isLoading, isError } = usePost(id);
  const toggleVote = useToggleVote();
  const ratePost = useRatePost();
  const unratePost = useUnratePost();

  // Las publicaciones de ítem viven en la página del ítem; aquí solo hay reseñas
  if (post?.kind === "item") {
    return <Navigate to={`/item/${post.rankableItem.id}`} replace />;
  }

  function goBack() {
    // key "default" = primera página de la sesión: no hay historial al que volver
    if (location.key === "default") navigate("/");
    else navigate(-1);
  }

  return (
    <div className="mx-auto max-w-xl">
      <button
        onClick={goBack}
        className="mb-4 flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      {isLoading && <div className="h-96 animate-pulse rounded-xl bg-surface" />}

      {!isLoading && (isError || !post) && (
        <p className="py-12 text-center text-foreground/60">
          No encontramos esta publicación.
        </p>
      )}

      {post && (
        <div data-theme={post.category}>
          <PostCard
            post={post}
            variant="full"
            onToggleVote={(postId) => toggleVote.mutate(postId)}
            onRate={(postId, score) => ratePost.mutate({ postId, score })}
            onUnrate={(postId) => unratePost.mutate(postId)}
            onOpenComments={() => setCommentsOpen(true)}
            onOpenShare={() => setShareOpen(true)}
          />
        </div>
      )}

      <CommentsPanel
        postId={commentsOpen && post ? post.id : null}
        onClose={() => setCommentsOpen(false)}
      />
      <SharePanel
        postId={shareOpen && post ? post.id : null}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}