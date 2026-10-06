import { MessageCircle, Play, Star } from "lucide-react";
import { CATEGORY_CONFIG } from "../../../constants/categoryConfig";
import type { Post } from "../../../types/post";

interface GalleryItemProps {
  post: Post;
  onSelect: (postId: string) => void;
}

export default function GalleryItem({ post, onSelect }: GalleryItemProps) {
  const VoteIcon = CATEGORY_CONFIG[post.category].likeIcon;
  const firstMedia = post.media[0];
  const cover = firstMedia?.thumbnailUrl ?? firstMedia?.url ?? post.rankableItem.coverUrl;

  return (
    <button
      onClick={() => onSelect(post.id)}
      data-theme={post.category}
      aria-label={`Ver ${post.rankableItem.title}`}
      className="group relative aspect-square overflow-hidden bg-surface"
    >
      <img
        src={cover}
        alt={post.rankableItem.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Rating siempre visible */}
      <div className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
        <Star size={11} className="text-primary" fill="currentColor" />
        {post.averageRating.toFixed(1)}
      </div>

      {firstMedia?.type === "video" && (
        <Play
          size={16}
          className="absolute left-1.5 top-1.5 text-white drop-shadow"
          fill="currentColor"
        />
      )}

      {/* Capa con contadores al pasar el mouse */}
      <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/50 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
        <span className="flex items-center gap-1">
          <VoteIcon size={16} />
          {post.votesCount}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle size={16} />
          {post.commentsCount}
        </span>
      </div>
    </button>
  );
}