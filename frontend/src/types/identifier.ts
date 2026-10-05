export type IdentifierRequirement = "required" | "recommended";

export interface IdentifierDefinition {
  key: string;
  label: string;
  description: string;
  requirement: IdentifierRequirement;
  pattern?: RegExp;
  grantsCertification: boolean;
}