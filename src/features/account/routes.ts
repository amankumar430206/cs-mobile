import type { UserRole } from "@castadi/shared/types";

// Literal hrefs per role so typed routes can check every destination.
const PARTNER = {
  profile: "/partner/account/profile",
  password: "/partner/account/password",
  notificationSettings: "/partner/account/notification-settings",
  kyc: "/partner/account/kyc",
  bankDetails: "/partner/account/bank-details",
} as const;

const ADVERTISER = {
  profile: "/advertiser/account/profile",
  password: "/advertiser/account/password",
  notificationSettings: "/advertiser/account/notification-settings",
  kyc: "/advertiser/account/kyc",
  bankDetails: "/advertiser/account/bank-details",
} as const;

export type AccountRoute = keyof typeof PARTNER;

export const accountRoutes = (role: UserRole) => (role === "SCREEN_PARTNER" ? PARTNER : ADVERTISER);
