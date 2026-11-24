import { api } from "../../lib/axios";

export type ModerationStatus = "pending" | "approved" | "rejected";
export type ModerationContentType = "item" | "post" | "review" | "comment" | "media";
export type ModerationTypeFilter = "all" | ModerationContentType;

interface ModerationAuthor {
  id: string;
  username: string;
}

interface ModerationEntryBase {
  id: string;
  status: ModerationStatus;
  submittedAt: string;
  author: ModerationAuthor;
}

export interface ModerationPost extends ModerationEntryBase {
  type: "post";
  content: {
    kind: "item";
    caption: string;
    item: {
      id: string;
      title: string;
      category: string;
      coverUrl: string | null;
    };
  };
}

export interface ModerationItem extends ModerationEntryBase {
  type: "item";
  content: {
    title: string;
    category: string;
    description: string;
    coverUrl: string | null;
    postId: string;
  };
}

export interface ModerationReview extends ModerationEntryBase {
  type: "review";
  content: {
    postId: string;
    itemId: string;
    text: string;
    authorScore: number | null;
  };
}

export interface ModerationComment extends ModerationEntryBase {
  type: "comment";
  content: {
    postId: string;
    parentId: string | null;
    text: string;
  };
}

export interface ModerationMedia extends ModerationEntryBase {
  type: "media";
  content: {
    postId: string;
    mediaType: "image" | "video" | "external";
    url: string;
    contentType: string | null;
    isCover: boolean;
  };
}

export type ModerationQueueItem =
  | ModerationItem
  | ModerationPost
  | ModerationReview
  | ModerationComment
  | ModerationMedia;

export interface ModerationQueuePage {
  items: ModerationQueueItem[];
  page: {
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
}

export interface ModerationDecision {
  id: string;
  type: ModerationContentType;
  status: "approved" | "rejected";
  moderatedAt: string;
  moderatedBy: ModerationAuthor;
  reason: string | null;
}

export async function getModerationQueue(input: {
  status: ModerationStatus;
  type: ModerationTypeFilter;
  limit: number;
  cursor?: string;
}): Promise<ModerationQueuePage> {
  const { data } = await api.get<ModerationQueuePage>("/admin/moderation", {
    params: input,
  });
  return data;
}

export async function approveModerationItem(
  type: ModerationContentType,
  id: string
): Promise<ModerationDecision> {
  const { data } = await api.post<ModerationDecision>(
    `/admin/moderation/${encodeURIComponent(type)}/${encodeURIComponent(id)}/approve`
  );
  return data;
}

export async function rejectModerationItem(
  type: ModerationContentType,
  id: string,
  reason: string
): Promise<ModerationDecision> {
  const { data } = await api.post<ModerationDecision>(
    `/admin/moderation/${encodeURIComponent(type)}/${encodeURIComponent(id)}/reject`,
    { reason }
  );
  return data;
}
