import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { ArrowLeft, Star } from "lucide-react";
import Tabs, { type TabItem } from "../../components/ui/Tabs";
import PostMediaFrame from "../../features/posts/components/PostMediaFrame";
import ReviewList from "../../features/posts/components/ReviewList";
import PostActions from "../../features/posts/components/PostActions";
import VerificationBadge from "../../features/posts/components/VerificationBadge";
import ItemDetails from "../../features/posts/components/ItemDetails";
import CreatorCard from "../../features/items/components/CreatorCard";
import ExternalLinks from "../../features/items/components/ExternalLinks";
import ItemChildrenList from "../../features/items/components/ItemChildrenList";
import CommentsPanel from "../../features/comments/components/CommentsPanel";
import SharePanel from "../../features/share/components/SharePanel";
import { useItem } from "../../features/items/hooks/useItem";
import { useItemChildren } from "../../features/items/hooks/useItemChildren";
import { useItemReviews } from "../../features/posts/hooks/useItemReviews";
import { useItemPost } from "../../features/posts/hooks/useItemPost";
import { useToggleVote } from "../../features/posts/hooks/useToggleVote";
import { useRatePost } from "../../features/posts/hooks/useRatePost";
import { useUnratePost } from "../../features/posts/hooks/useUnratePost";
import { useToggleCommentLike } from "../../features/comments/hooks/useToggleCommentLike";
import { CATEGORIES, CHILDREN_LABELS } from "../../categories/registry";
import { useRequireAuth } from "../../features/auth/hooks/useRequireAuth";
import SaveButton from "../../features/items/components/SaveButton";
import { getErrorMessage } from "../../lib/errors";

type ItemTab = "reviews" | "children" | "links" | "details";

export default function ItemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState<ItemTab>("reviews");
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);
  const [sharePostId, setSharePostId] = useState<string | null>(null);

  const { data: item, isLoading, isError } = useItem(id);
  const { data: parent } = useItem(item?.parentId);
  const {
    data: itemPost,
    isLoading: itemPostLoading,
    error: itemPostError,
  } = useItemPost(item?.id);
  const { data: children, isLoading: childrenLoading } = useItemChildren(
    item && item.childrenCount > 0 ? item.id : undefined
  );
  const {
    data: reviews,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useItemReviews(item?.id);

  const toggleVote = useToggleVote();
  const ratePost = useRatePost();
  const unratePost = useUnratePost();
  const toggleReviewLike = useToggleCommentLike(itemPost?.id ?? "");

  const requireAuth = useRequireAuth();

  const handlers = {
    onToggleVote: requireAuth((postId: string) => toggleVote.mutate(postId)),
    onRate: requireAuth((postId: string, score: number) =>
      ratePost.mutate({ postId, score })
    ),
    onUnrate: requireAuth((postId: string) => unratePost.mutate(postId)),
    onOpenComments: (postId: string) => setCommentsPostId(postId), // leer comentarios es libre
    onOpenShare: requireAuth((postId: string) => setSharePostId(postId)),
  };

  function goBack() {
    // key "default" = primera página de la sesión: no hay historial al que volver
    if (location.key === "default") navigate("/");
    else navigate(-1);
  }

  if (isLoading) {
    return <div className="mx-auto h-96 max-w-2xl animate-pulse rounded-xl bg-surface" />;
  }

  if (isError || !item) {
    return (
      <p className="py-12 text-center text-foreground/60">No encontramos este ítem.</p>
    );
  }

  const childrenLabel = CHILDREN_LABELS[item.category];
  const noItemPost = isAxiosError(itemPostError) && itemPostError.response?.status === 404;
  const directRating = itemPost?.averageRating ?? item.averageRating;
  const directCount = itemPost?.ratingsCount ?? item.ratingsCount;

  const tabs: TabItem<ItemTab>[] = [
    { id: "reviews", label: "Reseñas", count: reviews?.length },
    ...(item.childrenCount > 0
      ? [{ id: "children" as const, label: childrenLabel, count: item.childrenCount }]
      : []),
    { id: "links", label: "Dónde encontrarlo", count: item.externalLinks.length },
    { id: "details", label: "Detalles" },
  ];

  return (
    <div data-theme={item.category} className="mx-auto max-w-2xl">
      <button
        onClick={goBack}
        className="mb-4 flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      {/* Portada y datos principales */}
      <div className="mb-4 flex gap-4">
        <img
          src={item.coverUrl}
          alt={item.title}
          className="h-32 w-32 shrink-0 rounded-xl object-cover sm:h-40 sm:w-40"
        />
        <div className="min-w-0 flex-1">
          {parent && (
            <Link
              to={`/item/${parent.id}`}
              className="text-xs text-foreground/50 hover:text-primary"
            >
              Parte de {parent.title}
            </Link>
          )}
          <h1 className="text-xl font-bold leading-tight text-foreground">{item.title}</h1>
          <p className="mt-0.5 text-xs text-foreground/50">
            {CATEGORIES[item.category].label}
            {item.year && ` · ${item.year}`}
          </p>
          <div className="mt-2">
            <CreatorCard creator={item.creator} />
          </div>
          <div className="mt-2">
            <VerificationBadge status={item.verificationStatus} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <SaveButton item={item} />
            <span className="text-xs text-foreground/50">
              En {item.savesCount} {item.savesCount === 1 ? "lista" : "listas"}
            </span>
          </div>
        </div>
      </div>

      {item.description && (
        <p className="mb-4 text-sm text-foreground/80">{item.description}</p>
      )}

      {itemPost?.media
        .filter((media) => media.id !== `${itemPost.id}-cover`)
        .map((media) => (
          <div key={media.id} className="mb-3">
            <PostMediaFrame media={media} alt={item.title} expanded />
          </div>
        ))}

      {!itemPostLoading && noItemPost && (
        <Link
          to="/create-post"
          state={{ itemId: item.id, kind: "item" }}
          className="mb-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          Crear publicación para esta obra
        </Link>
      )}
      {itemPostError && !noItemPost && (
        <p role="alert" className="mb-4 text-sm text-red-500">{getErrorMessage(itemPostError)}</p>
      )}

      {/* Puntuaciones: la directa y, si es colección, el promedio de sus hijos */}
      <div className="mb-4 flex gap-3">
        <div className="flex-1 rounded-xl border border-foreground/10 bg-surface p-3">
          <p className="text-xs text-foreground/50">Puntuación</p>
          <p className="flex items-center gap-1.5 text-2xl font-bold text-foreground">
            <Star size={20} className="text-primary" fill="currentColor" />
            {directCount > 0 ? directRating.toFixed(1) : "—"}
          </p>
          <p className="text-xs text-foreground/40">{directCount} puntuaciones</p>
        </div>

        {item.childrenCount > 0 && item.childrenAverageRating !== undefined && (
          <div className="flex-1 rounded-xl border border-foreground/10 bg-surface p-3">
            <p className="text-xs text-foreground/50">
              Promedio de {childrenLabel.toLowerCase()}
            </p>
            <p className="flex items-center gap-1.5 text-2xl font-bold text-foreground">
              <Star size={20} className="text-primary" fill="currentColor" />
              {item.childrenAverageRating.toFixed(1)}
            </p>
            <p className="text-xs text-foreground/40">
              {item.childrenCount} {childrenLabel.toLowerCase()}
            </p>
          </div>
        )}
      </div>

      {/* Interacciones con el ítem (votar, puntuar, comentar, compartir) */}
      {itemPost && (
        <div className="mb-6 rounded-xl border border-foreground/10 bg-surface px-4 pb-4">
          <PostActions
            post={itemPost}
            onToggleVote={() => handlers.onToggleVote(itemPost.id)}
            onRate={(score) => handlers.onRate(itemPost.id, score)}
            onUnrate={() => handlers.onUnrate(itemPost.id)}
            onOpenComments={() => handlers.onOpenComments(itemPost.id)}
            onOpenShare={() => handlers.onOpenShare(itemPost.id)}
          />
        </div>
      )}

      <Tabs<ItemTab> tabs={tabs} active={tab} onChange={setTab} />

      {tab === "reviews" && (
        <>
          {itemPost && (
            <Link
              to="/create-post"
              state={{ itemId: item.id, kind: "review" }}
              className="mt-4 inline-flex rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary"
            >
              Escribir reseña
            </Link>
          )}
          <ReviewList
            reviews={reviews ?? []}
            item={item}
            isLoading={itemPostLoading || reviewsLoading}
            emptyMessage="Todavía no hay reseñas de este ítem."
            errorMessage={reviewsError ? getErrorMessage(reviewsError) : undefined}
            onToggleLike={requireAuth((reviewId: string) => toggleReviewLike.mutate(reviewId))}
          />
        </>
      )}

      {tab === "children" && (
        <ItemChildrenList items={children ?? []} isLoading={childrenLoading} />
      )}

      {tab === "links" && <ExternalLinks links={item.externalLinks} />}

      {tab === "details" && <ItemDetails item={item} />}

      <CommentsPanel postId={commentsPostId} onClose={() => setCommentsPostId(null)} />
      <SharePanel postId={sharePostId} onClose={() => setSharePostId(null)} />
    </div>
  );
}