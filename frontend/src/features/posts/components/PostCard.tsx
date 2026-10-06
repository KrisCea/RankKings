import { Link } from "react-router-dom";
import PostActions from "./PostActions";
import VerificationBadge from "./VerificationBadge";
import type { Post } from "../../../types/post";
import Avatar from "../../../components/ui/Avatar";
import UserHoverCard from "../../users/components/UserHoverCard";

interface PostCardProps {
  post: Post;
  onToggleVote: (postId: string) => void;
  onRate: (postId: string, score: number) => void;
  onUnrate: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  onOpenShare: (postId: string) => void;
}

export default function PostCard({
  post,
  onToggleVote,
  onRate,
  onUnrate,
  onOpenComments,
  onOpenShare,
}: PostCardProps) {
  return (
    <article
      data-theme={post.category}
      className="bg-surface border border-foreground/10 rounded-xl overflow-hidden mb-4"
    >
      {/* Header: autor */}
      <div className="flex items-center gap-3 p-4">
        <UserHoverCard username={post.author.username}>
          <Avatar src={post.author.avatarUrl} alt={post.author.displayName} size={36} />
        </UserHoverCard>
        <UserHoverCard username={post.author.username}>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {post.author.displayName}
              {post.author.isVerifiedBusiness && (
                <span className="ml-1 text-primary text-xs">●</span>
              )}
            </p>
            <p className="text-xs text-foreground/50">@{post.author.username}</p>
          </div>
        </UserHoverCard>
      </div>

      {/* Media */}
      {post.media[0] && (
        <div className="w-full aspect-square bg-background">
          <img
            src={post.media[0].url}
            alt={post.rankableItem.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Contenido */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-semibold text-foreground">{post.rankableItem.title}</h3>
            <p className="text-xs text-foreground/50">
              {post.rankableItem.creator.name}
              {post.rankableItem.year && ` · ${post.rankableItem.year}`}
            </p>
          </div>
          <VerificationBadge status={post.rankableItem.verificationStatus} />
        </div>

        <p className="text-sm text-foreground/80">{post.caption}</p>

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