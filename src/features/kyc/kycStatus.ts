import type { Tone } from "@/ui";

export type KycStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

const COPY: Record<KycStatus, { label: string; tone: Tone; message: string }> = {
  PENDING: { label: "Not submitted", tone: "default", message: "Submit your details and documents to get verified." },
  UNDER_REVIEW: { label: "Under review", tone: "warning", message: "We're reviewing your details and will notify you once it's decided." },
  APPROVED: { label: "Verified", tone: "success", message: "Your account is verified." },
  REJECTED: { label: "Changes needed", tone: "danger", message: "Update your details and resubmit." },
};

export const kycStatusCopy = (status: KycStatus) => COPY[status] ?? COPY.PENDING;

export const canSubmitKyc = (status: KycStatus) => status === "PENDING" || status === "REJECTED";

/** cs-api's Joi schemas reject empty strings for optional fields, so blank inputs are omitted. */
export function withoutBlanks<T extends Record<string, unknown>>(values: T): Partial<T> {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== "" && value !== undefined)) as Partial<T>;
}
