import GalleryItem from "./GalleryItem";
import type { Post } from "../../../types/post";

interface GalleryViewProps {
  posts: Post[];
  isLoading: boolean;
  onSelectPost: (postId: string) => void;
}

export default function GalleryView({ posts, isLoading, onSelectPost }: GalleryViewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse bg-surface" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="py-12 text-center text-foreground/60">Todavía no hay publicaciones.</p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <GalleryItem key={post.id} post={post} onSelect={onSelectPost} />
      ))}
    </div>
  );
}