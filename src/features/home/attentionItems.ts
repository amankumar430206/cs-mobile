import type { CurrentUser } from "@castadi/shared/types";

export interface AttentionItem {
  key: string;
  title: string;
  description: string;
}

// Live "what still needs doing" list, mirroring cs-web's ActionableItemsCard plus a rejected-KYC
// and awaiting-payment reminder. KYC and payments aren't in the app yet, so items point to the web.
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
        ? "Have your business address, GST/PAN and ID documents ready, then submit from the CASTADI web dashboard."
        : "Have your Aadhaar, PAN, bank details and ID documents ready, then submit from the CASTADI web dashboard.",
    });
  } else if (kycStatus === "REJECTED") {
    items.push({
      key: "kyc-rejected",
      title: "Your KYC needs changes",
      description: "Review the rejection reason and resubmit from the CASTADI web dashboard.",
    });
  } else if (kycStatus === "APPROVED" && profile && !profile.bank_account_number) {
    items.push({
      key: "bank-details",
      title: "Add your bank details",
      description: isAdvertiser
        ? "Needed for refunds — account number, IFSC code and account holder name."
        : "Needed to receive payouts — account number, IFSC code and account holder name.",
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
