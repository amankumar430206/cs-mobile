import type { UserRole } from "@castadi/shared/types";

// Literal hrefs per role so typed routes can check every destination.
const PARTNER = {
  profile: "/partner/account/profile",
  password: "/partner/account/password",
  notificationSettings: "/partner/account/notification-settings",
  kyc: "/partner/account/kyc",
  bankDetails: "/partner/account/bank-details",
  help: "/partner/account/help/index",
  support: "/partner/account/support/index",
  newTicket: "/partner/account/support/new",
} as const;

const ADVERTISER = {
  profile: "/advertiser/account/profile",
  password: "/advertiser/account/password",
  notificationSettings: "/advertiser/account/notification-settings",
  kyc: "/advertiser/account/kyc",
  bankDetails: "/advertiser/account/bank-details",
  help: "/advertiser/account/help/index",
  support: "/advertiser/account/support/index",
  newTicket: "/advertiser/account/support/new",
} as const;

export type AccountRoute = keyof typeof PARTNER;

export const accountRoutes = (role: UserRole) => (role === "SCREEN_PARTNER" ? PARTNER : ADVERTISER);

export const ticketRoute = (role: UserRole, id: string) =>
  role === "SCREEN_PARTNER"
    ? ({ pathname: "/partner/account/support/[id]", params: { id } } as const)
    : ({ pathname: "/advertiser/account/support/[id]", params: { id } } as const);

export const articleRoute = (role: UserRole, id: string) =>
  role === "SCREEN_PARTNER"
    ? ({ pathname: "/partner/account/help/[id]", params: { id } } as const)
    : ({ pathname: "/advertiser/account/help/[id]", params: { id } } as const);
