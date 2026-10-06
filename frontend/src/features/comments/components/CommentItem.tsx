import { Heart } from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import UserHoverCard from "../../users/components/UserHoverCard";
import type { Comment } from "../../../types/comment";

interface CommentItemProps {
  comment: Comment;
  onToggleLike: (commentId: string) => void;
  onReply: (comment: Comment) => void;
  isReply?: boolean;
}

function timeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function CommentItem({
  comment,
  onToggleLike,
  onReply,
  isReply = false,
}: CommentItemProps) {
  return (
    <div className={`flex gap-3 ${isReply ? "py-2" : "py-3"}`}>
      <UserHoverCard username={comment.author.username}>
        <Avatar
          src={comment.author.avatarUrl}
          alt={comment.author.username}
          size={isReply ? 24 : 32}
        />
      </UserHoverCard>

      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <UserHoverCard username={comment.author.username}>
            <span className="font-medium text-foreground">@{comment.author.username}</span>
          </UserHoverCard>{" "}
          {comment.replyToUsername && (
            <span className="text-primary">@{comment.replyToUsername} </span>
          )}
          <span className="text-foreground/80">{comment.text}</span>
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-foreground/40">{timeAgo(comment.createdAt)}</span>
          <button
            onClick={() => onToggleLike(comment.id)}
            className={`flex items-center gap-1 text-xs transition-colors ${
              comment.likedByCurrentUser ? "text-primary" : "text-foreground/50 hover:text-primary"
            }`}
          >
            <Heart size={13} fill={comment.likedByCurrentUser ? "currentColor" : "none"} />
            {comment.likesCount > 0 && comment.likesCount}
          </button>
          <button
            onClick={() => onReply(comment)}
            className="text-xs text-foreground/50 hover:text-foreground transition-colors"
          >
            Responder
          </button>
        </div>
      </div>
    </div>
  );
}