import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import PostActions from "./PostActions";
import PostMediaFrame from "./PostMediaFrame";
import VerificationBadge from "./VerificationBadge";
import RankableItemSummary from "./RankableItemSummary";
import Avatar from "../../../components/ui/Avatar";
import UserHoverCard from "../../users/components/UserHoverCard";
import type { Post } from "../../../types/post";
import SaveButton from "../../items/components/SaveButton";

interface PostCardProps {
  post: Post;
  variant?: "preview" | "full";
  focused?: boolean; // en el feed: solo el post en foco muestra la imagen expandida
  showItem?: boolean; // en reseñas: muestra la franja del ítem reseñado
  onToggleVote: (postId: string) => void;
  onRate: (postId: string, score: number) => void;
  onUnrate: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  onOpenShare: (postId: string) => void;
}

function PostLink({
  to,
  enabled,
  className,
  children,
}: {
  to: string;
  enabled: boolean;
  className?: string;
  children: ReactNode;
}) {
  if (!enabled) return <div className={className}>{children}</div>;
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

export default function PostCard({
  post,
  variant = "preview",
  focused = true,
  showItem = true,
  onToggleVote,
  onRate,
  onUnrate,
  onOpenComments,
  onOpenShare,
}: PostCardProps) {
  const isPreview = variant === "preview";
  const isReview = post.kind === "review";
  const captionClamp = isPreview ? (isReview ? "line-clamp-4" : "line-clamp-3") : "";

  // La imagen se colapsa solo en la vista previa del feed y cuando el post no tiene foco
  const expanded = !isPreview || focused;

  // Una publicación de ítem lleva a la página del ítem; una reseña, a su propia página.
  const destination = isReview ? `/post/${post.id}` : `/item/${post.rankableItem.id}`;

  return (
    <article
      data-theme={post.category}
      data-focus-id={post.id}
      className="bg-surface border border-foreground/10 rounded-xl overflow-hidden mb-4"
    >
      {/* Header: autor (con su propia vista previa de perfil, fuera del link del post) */}
      <div className="flex items-center gap-3 p-4">
        <UserHoverCard username={post.author.username}>
          <Avatar src={post.author.avatarUrl} alt={post.author.displayName} size={36} />
        </UserHoverCard>
        <UserHoverCard username={post.author.username}>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {post.author.displayName}
              {post.author.isVerifiedBusiness && (
                <span className="ml-1 text-primary text-xs">●</span>
              )}
            </p>
            <p className="text-xs text-foreground/50">@{post.author.username}</p>
          </div>
        </UserHoverCard>

        {isReview ? (
          <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            Reseña
          </span>
        ) : (
          <SaveButton item={post.rankableItem} variant="icon" className="ml-auto" />
        )}
      </div>

      {/* Contenido */}
      {isReview ? (
        <div className="px-4 pb-3">
          {showItem && <RankableItemSummary item={post.rankableItem} />}

          <PostLink
            to={destination}
            enabled={isPreview}
            className={`block ${showItem ? "mt-3" : ""}`}
          >
            {post.review && (
              <div className="mb-2 flex items-center gap-1.5 text-sm">
                <Star size={16} className="text-primary" fill="currentColor" />
                <span className="font-semibold text-foreground">
                  {post.review.authorScore.toFixed(1)}
                </span>
                <span className="text-xs text-foreground/50">
                  nota de @{post.author.username}
                </span>
              </div>
            )}

            <p className={`text-sm text-foreground/80 lg:text-base ${captionClamp}`}>
              {post.caption}
            </p>
          </PostLink>
        </div>
      ) : (
        <PostLink to={destination} enabled={isPreview} className="block">
          {post.media[0] && (
            <PostMediaFrame
              media={post.media[0]}
              alt={post.rankableItem.title}
              expanded={expanded}
            />
          )}

          <div className="px-4 pt-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold text-foreground lg:text-lg">
                  {post.rankableItem.title}
                </h3>
                <p className="text-xs text-foreground/50">
                  {post.rankableItem.creator.name}
                  {post.rankableItem.year && ` · ${post.rankableItem.year}`}
                </p>
              </div>
              <VerificationBadge status={post.rankableItem.verificationStatus} />
            </div>

            <p className={`text-sm text-foreground/80 lg:text-base ${captionClamp}`}>
              {post.caption}
            </p>
          </div>
        </PostLink>
      )}

      {/* Acciones: fuera del link para que cada botón funcione por separado */}
      <div className="px-4 pb-4">
        <PostActions
          post={post}
          onToggleVote={() => onToggleVote(post.id)}
          onRate={(score) => onRate(post.id, score)}
          onUnrate={() => onUnrate(post.id)}
          onOpenComments={() => onOpenComments(post.id)}
          onOpenShare={() => onOpenShare(post.id)}
        />
      </div>
    </article>
  );
}