import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Tabs, { type TabItem } from "../../components/ui/Tabs";
import ProfileHeader from "../../features/users/components/ProfileHeader";
import PostList from "../../features/posts/components/PostList";
import { useUserProfile } from "../../features/users/hooks/useUserProfile";
import { useCurrentUser } from "../../features/users/hooks/useCurrentUser";
import { useUserPosts } from "../../features/posts/hooks/useUserPosts";
import type { PostKind } from "../../types/post";

type ProfileTab = "posts" | "reviews";

const TABS: TabItem<ProfileTab>[] = [
  { id: "posts", label: "Publicaciones" },
  { id: "reviews", label: "Reseñas" },
];

const KIND_BY_TAB: Record<ProfileTab, PostKind> = {
  posts: "item",
  reviews: "review",
};

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const [tab, setTab] = useState<ProfileTab>("posts");

  const { data: profile, isLoading, isError } = useUserProfile(username ?? null);
  const { data: currentUser } = useCurrentUser();
  const { data: posts, isLoading: postsLoading } = useUserPosts(username, KIND_BY_TAB[tab]);

  if (isLoading) {
    return <div className="mx-auto h-56 max-w-3xl animate-pulse rounded-2xl bg-surface" />;
  }

  if (isError || !profile) {
    return (
      <div className="py-12 text-center">
        <p className="text-foreground/60">No encontramos a este usuario.</p>
        <Link to="/" className="mt-2 inline-block text-sm text-primary hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  const emptyMessage =
    tab === "posts"
      ? isOwnProfile
        ? "Todavía no publicaste nada."
        : "Todavía no hay publicaciones."
      : isOwnProfile
        ? "Todavía no escribiste reseñas."
        : "Todavía no hay reseñas.";

  return (
    <div className="mx-auto w-full max-w-3xl">
      <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <PostList posts={posts ?? []} isLoading={postsLoading} emptyMessage={emptyMessage} />
    </div>
  );
}