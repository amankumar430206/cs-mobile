import type { ScreenVerificationStatus } from "@castadi/shared/types";
import type { Tone } from "@/ui";

export const SCREEN_STATUS: Record<ScreenVerificationStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Pending", tone: "default" },
  UNDER_REVIEW: { label: "Under review", tone: "warning" },
  ACTIVE: { label: "Active", tone: "success" },
  REJECTED: { label: "Rejected", tone: "danger" },
};

/** Photos can only be added, replaced or removed before review — same rule as cs-web's uploader. */
export const canManageMedia = (status: ScreenVerificationStatus) => status === "PENDING" || status === "REJECTED";

export const openScreenDetail = (id: string) => ({ pathname: "/partner/screens/[id]", params: { id } }) as const;
export const editScreenRoute = (id: string) => ({ pathname: "/partner/screens/[id]/edit", params: { id } }) as const;
export const screenMediaRoute = (id: string) => ({ pathname: "/partner/screens/[id]/media", params: { id } }) as const;
