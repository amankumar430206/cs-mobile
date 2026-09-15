import type { ScreenVerificationStatus } from "@castadi/shared/types";
import type { Tone } from "@/ui";

export const SCREEN_STATUS: Record<ScreenVerificationStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Pending", tone: "default" },
  UNDER_REVIEW: { label: "Under review", tone: "warning" },
  ACTIVE: { label: "Active", tone: "success" },
  REJECTED: { label: "Rejected", tone: "danger" },
};

export const openScreenDetail = (id: string) => ({ pathname: "/partner/screens/[id]", params: { id } }) as const;
