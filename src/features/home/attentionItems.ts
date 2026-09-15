import type { CurrentUser } from "@castadi/shared/types";
import type { AccountRoute } from "@/features/account/routes";

export interface AttentionItem {
  key: string;
  title: string;
  description: string;
  /** In-app destination that resolves the item, when there is one. */
  action?: AccountRoute;
}

// Live "what still needs doing" list, mirroring cs-web's ActionableItemsCard plus a rejected-KYC
// and awaiting-payment reminder.
export function buildAttentionItems(user: CurrentUser, campaignsAwaitingPayment = 0): AttentionItem[] {
  const items: AttentionItem[] = [];
  const isAdvertiser = user.role === "ADVERTISER";
  const profile = isAdvertiser ? user.advertiser : user.screenPartner;
  const kycStatus = isAdvertiser ? user.advertiser?.verification_status : user.screenPartner?.kyc_status;

  if (kycStatus === "PENDING") {
    items.push({
      key: "kyc-pending",
      title: "Complete your KYC verification",
      description: isAdvertiser
        ? "Keep your business address, GST/PAN and registration documents handy."
        : "Keep your Aadhaar, PAN, bank details and ID documents handy.",
      action: "kyc",
    });
  } else if (kycStatus === "REJECTED") {
    items.push({
      key: "kyc-rejected",
      title: "Your KYC needs changes",
      description: "Review the reason and resubmit your details.",
      action: "kyc",
    });
  } else if (kycStatus === "APPROVED" && profile && !profile.bank_account_number) {
    items.push({
      key: "bank-details",
      title: "Add your bank details",
      description: isAdvertiser
        ? "Needed for refunds — account number, IFSC code and account holder name."
        : "Needed to receive payouts — account number, IFSC code and account holder name.",
      action: "bankDetails",
    });
  }

  if (isAdvertiser && campaignsAwaitingPayment > 0) {
    items.push({
      key: "awaiting-payment",
      title: `${campaignsAwaitingPayment} ${campaignsAwaitingPayment === 1 ? "campaign is" : "campaigns are"} awaiting payment`,
      description: "Complete payment before the screen reservation hold expires.",
    });
  }

  return items;
}
