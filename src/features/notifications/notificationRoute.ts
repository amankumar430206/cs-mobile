import type { Href } from "expo-router";
import type { UserRole } from "@castadi/shared/types";
import { accountRoutes } from "@/features/account/routes";
import { openCampaignDetail } from "@/features/campaigns/campaignStatus";
import { openScreenDetail } from "@/features/screens/screenStatus";

/**
 * cs-api notification links are cs-web paths (e.g. "/campaigns/<id>?tab=payments"). This maps the ones the app
 * has a screen for; anything else (support tickets, report downloads, admin pages) falls back to the inbox.
 */
export function notificationRoute(link: string | null | undefined, role: UserRole): Href {
  const fallback: Href = "/notifications";
  if (!link || !link.startsWith("/")) return fallback;

  const [path] = link.split(/[?#]/);
  const segments = path.split("/").filter(Boolean);
  const [section, id] = segments;
  const isPartner = role === "SCREEN_PARTNER";

  switch (section) {
    case "dashboard":
      return isPartner ? "/partner" : "/advertiser";
    case "kyc":
      return accountRoutes(role).kyc;
    case "campaigns":
      if (isPartner) return fallback;
      return id ? openCampaignDetail(id) : "/advertiser/campaigns";
    case "my-screens":
      if (!isPartner) return fallback;
      return id ? openScreenDetail(id) : "/partner/screens";
    case "earnings":
      return isPartner ? "/partner/earnings" : fallback;
    case "wallet":
      return isPartner ? fallback : "/advertiser/wallet";
    default:
      return fallback;
  }
}
