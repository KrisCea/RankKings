import { usePosts } from "../../features/posts/hooks/usePosts";
import { useToggleVote } from "../../features/posts/hooks/useToggleVote";
import { useRatePost } from "../../features/posts/hooks/useRatePost";
import { useUnratePost } from "../../features/posts/hooks/useUnratePost";
import PostCard from "../../features/posts/components/PostCard";

export default function Home() {
  const { data: posts, isLoading } = usePosts();
  const toggleVote = useToggleVote();
  const ratePost = useRatePost();
  const unratePost = useUnratePost();

  if (isLoading) return <p>Cargando...</p>;

  return (
    <div className="max-w-xl mx-auto">
      {posts?.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onToggleVote={(id) => toggleVote.mutate(id)}
          onRate={(id, score) => ratePost.mutate({ postId: id, score })}
          onUnrate={(id) => unratePost.mutate(id)}
          onOpenComments={(id) => console.log("comments", id)}
          onOpenShare={(id) => console.log("share", id)}
        />
      ))}
    </div>
  );
}