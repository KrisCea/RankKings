import type { ReactNode } from "react";
import Avatar from "../../../components/ui/Avatar";
import type { UserSummary } from "../../../types/user";

interface UserListItemProps {
  user: UserSummary;
  action?: ReactNode;
}

export default function UserListItem({ user, action }: UserListItemProps) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Avatar src={user.avatarUrl} alt={user.displayName} size={40} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {user.displayName}
          {user.isVerifiedBusiness && <span className="ml-1 text-primary text-xs">●</span>}
        </p>
        <p className="text-xs text-foreground/50 truncate">@{user.username}</p>
      </div>
      {action}
    </div>
  );
}