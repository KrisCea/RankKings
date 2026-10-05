import { useState } from "react";
import { CATEGORY_CONFIG } from "../../../constants/categoryConfig";
import type { CategoryId } from "../../../constants/categories";

interface VoteButtonProps {
  category: CategoryId;
  votesCount: number;
  votedByCurrentUser: boolean;
  onToggle: () => void;
}

export default function VoteButton({
  category,
  votesCount,
  votedByCurrentUser,
  onToggle,
}: VoteButtonProps) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.likeIcon;

  return (
    <button
      onClick={onToggle}
      aria-label={config.likeLabel}
      aria-pressed={votedByCurrentUser}
      className={`flex items-center gap-1.5 text-sm transition-colors ${
        votedByCurrentUser ? "text-primary" : "text-foreground/70 hover:text-primary"
      }`}
    >
      <Icon size={20} fill={votedByCurrentUser ? "currentColor" : "none"} />
      <span>{votesCount}</span>
    </button>
  );
}