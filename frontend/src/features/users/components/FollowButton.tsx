import { useRequireAuth } from "../../auth/hooks/useRequireAuth";
import { useToggleFollow } from "../hooks/useToggleFollow";
import type { UserProfile } from "../../../types/user";

interface FollowButtonProps {
  profile: UserProfile;
  className?: string;
}

export default function FollowButton({ profile, className = "" }: FollowButtonProps) {
  const toggleFollow = useToggleFollow();
  const requireAuth = useRequireAuth();
  const following = profile.isFollowedByCurrentUser;

  return (
    <button
      type="button"
      onClick={requireAuth(() => toggleFollow.mutate(profile.username))}
      disabled={toggleFollow.isPending}
      aria-pressed={following}
      className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors disabled:opacity-60 ${
        following
          ? "border border-foreground/10 bg-surface text-foreground hover:text-red-500"
          : "bg-primary text-white"
      } ${className}`}
    >
      {following ? "Siguiendo" : "Seguir"}
    </button>
  );
}