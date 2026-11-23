import { Link } from "react-router-dom";
import { BadgeCheck, Bookmark } from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import FollowButton from "./FollowButton";
import { LIST_NAME } from "../../../constants/lists";
import type { UserProfile } from "../../../types/user";

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-xs text-foreground/50">{label}</p>
    </div>
  );
}

export default function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  return (
    <section className="mb-6 rounded-2xl border border-foreground/10 bg-surface p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar
          src={profile.avatarUrl}
          alt={profile.displayName}
          size={96}
          className="shrink-0"
        />

        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-1.5 text-xl font-bold text-foreground">
            <span className="truncate">{profile.displayName}</span>
            {profile.isVerifiedBusiness && (
              <BadgeCheck
                size={18}
                className="shrink-0 text-primary"
                aria-label="Cuenta verificada"
              />
            )}
          </h1>
          <p className="text-sm text-foreground/50">
            @{profile.username}
            {profile.accountType === "business" && " · Cuenta de empresa"}
          </p>
          {profile.bio && <p className="mt-2 text-sm text-foreground/80">{profile.bio}</p>}
        </div>

        <div className="flex shrink-0 gap-2">
          {isOwnProfile ? (
            <Link
              to="/library"
              className="flex items-center gap-2 rounded-full border border-foreground/10 px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Bookmark size={16} />
              {LIST_NAME}
            </Link>
          ) : (
            <FollowButton profile={profile} />
          )}
        </div>
      </div>

      <div className="mt-5 flex gap-8 border-t border-foreground/10 pt-4">
        <Stat value={profile.postsCount.toLocaleString("es")} label="publicaciones" />
        <Stat value={profile.followersCount.toLocaleString("es")} label="seguidores" />
        <Stat value={profile.followingCount.toLocaleString("es")} label="siguiendo" />
      </div>
    </section>
  );
}