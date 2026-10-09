import { Link } from "react-router-dom";
import Avatar from "../../../components/ui/Avatar";
import FollowButton from "./FollowButton";
import { useUserProfile } from "../hooks/useUserProfile";
import { useCurrentUser } from "../hooks/useCurrentUser";

interface UserPreviewCardProps {
  username: string;
}

export default function UserPreviewCard({ username }: UserPreviewCardProps) {
  const { data: profile, isLoading } = useUserProfile(username);
  const { data: currentUser } = useCurrentUser();

  if (isLoading || !profile) {
    return (
      <div className="w-64 p-4 rounded-xl border border-foreground/10 bg-background shadow-lg">
        <div className="h-4 w-24 bg-surface rounded animate-pulse" />
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="w-64 p-4 rounded-xl border border-foreground/10 bg-background shadow-lg">
      <Link to={`/profile/${profile.username}`} className="flex items-center gap-3 mb-3">
        <Avatar src={profile.avatarUrl} alt={profile.displayName} size={48} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {profile.displayName}
            {profile.isVerifiedBusiness && <span className="ml-1 text-primary">●</span>}
          </p>
          <p className="text-xs text-foreground/50">@{profile.username}</p>
        </div>
      </Link>

      {profile.bio && (
        <p className="text-xs text-foreground/70 mb-3 line-clamp-2">{profile.bio}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-foreground/70 mb-3">
        <span>
          <strong className="text-foreground">{profile.postsCount}</strong> posts
        </span>
        <span>
          <strong className="text-foreground">{profile.followersCount.toLocaleString()}</strong>{" "}
          seguidores
        </span>
        <span>
          <strong className="text-foreground">{profile.followingCount}</strong> siguiendo
        </span>
      </div>

      {isOwnProfile ? (
        <Link
          to={`/profile/${profile.username}`}
          className="block w-full rounded-full border border-foreground/10 bg-surface py-1.5 text-center text-sm font-medium text-foreground"
        >
          Ver mi perfil
        </Link>
      ) : (
        <FollowButton profile={profile} className="w-full" />
      )}
    </div>
  );
}