import Avatar from "../../../components/ui/Avatar";
import UserHoverCard from "../../users/components/UserHoverCard";
import type { Creator } from "../../../types/creator";

interface CreatorCardProps {
  creator: Creator;
}

export default function CreatorCard({ creator }: CreatorCardProps) {
  const content = (
    <div className="flex items-center gap-2">
      <Avatar src={creator.avatarUrl} alt={creator.name} size={28} />
      <span className="text-sm font-medium text-foreground">{creator.name}</span>
    </div>
  );

  // Si el creador tiene cuenta en la plataforma, se muestra su mini perfil
  if (creator.linkedUsername) {
    return <UserHoverCard username={creator.linkedUsername}>{content}</UserHoverCard>;
  }

  return content;
}