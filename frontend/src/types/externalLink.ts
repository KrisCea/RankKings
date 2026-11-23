export type ExternalLinkType = "streaming" | "store" | "social" | "other";

export interface ExternalLink {
  id: string;
  label: string;
  url: string;
  type: ExternalLinkType;
}