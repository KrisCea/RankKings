import { CATEGORY_REQUIREMENTS } from "../constants/categoryRequirements";
import { ENFORCE_REQUIRED_IDENTIFIERS } from "../constants/config";
import type { CategoryId } from "../constants/categories";
import type { VerificationStatus } from "../types/rankableItem";

export function validateIdentifiers(
  category: CategoryId,
  identifiers: Record<string, string>
): { valid: boolean; missingRequired: string[]; status: VerificationStatus } {
  const defs = CATEGORY_REQUIREMENTS[category] ?? [];
  const missingRequired = defs
    .filter((d) => d.requirement === "required" && !identifiers[d.key])
    .map((d) => d.key);

  const hasCertifying = defs.some((d) => d.grantsCertification && identifiers[d.key]);

  let status: VerificationStatus = "unverified";
  if (missingRequired.length === 0) {
    status = hasCertifying ? "verified" : "partial";
  }

  const valid = ENFORCE_REQUIRED_IDENTIFIERS ? missingRequired.length === 0 : true;

  return { valid, missingRequired, status };
}