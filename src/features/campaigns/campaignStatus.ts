import type { CampaignStatus } from "@castadi/shared/types";
import type { Tone } from "@/ui";

export const CAMPAIGN_STATUS: Record<CampaignStatus, { label: string; tone: Tone }> = {
  DRAFT: { label: "Draft", tone: "default" },
  PENDING_PAYMENT: { label: "Awaiting payment", tone: "warning" },
  CONFIRMED: { label: "Confirmed", tone: "primary" },
  ACTIVE: { label: "Active", tone: "success" },
  CANCELLED: { label: "Cancelled", tone: "danger" },
};

export const openCampaignDetail = (id: string) => ({ pathname: "/advertiser/campaigns/[id]", params: { id } }) as const;
