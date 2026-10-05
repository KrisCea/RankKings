import { MessageCircle, Share2 } from "lucide-react";
import VoteButton from "./VoteButton";
import RatingControl from "./RatingControl";
import RatingBadge from "./RatingBadge";
import type { Post } from "../../../types/post";

interface PostActionsProps {
  post: Post;
  onToggleVote: () => void;
  onRate: (score: number) => void;
  onOpenComments: () => void;
  onOpenShare: () => void;
}

export default function PostActions({
  post,
  onToggleVote,
  onRate,
  onOpenComments,
  onOpenShare,
}: PostActionsProps) {
  return (
    <div className="flex flex-col gap-3 pt-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <VoteButton
            category={post.category}
            votesCount={post.votesCount}
            votedByCurrentUser={post.votedByCurrentUser}
            onToggle={onToggleVote}
          />

          <button
            onClick={onOpenComments}
            className="flex items-center gap-1.5 text-sm text-foreground/70 hover:text-primary transition-colors"
          >
            <MessageCircle size={20} />
            <span>{post.commentsCount}</span>
          </button>

          <button
            onClick={onOpenShare}
            className="flex items-center gap-1.5 text-sm text-foreground/70 hover:text-primary transition-colors"
          >
            <Share2 size={20} />
            <span>{post.sharesCount}</span>
          </button>
        </div>

        <RatingBadge averageRating={post.averageRating} ratingsCount={post.ratingsCount} />
      </div>

      <RatingControl currentUserRating={post.currentUserRating} onRate={onRate} />
    </div>
  );
}