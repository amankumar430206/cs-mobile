import { describe, expect, it } from "@jest/globals";
import { notificationRoute } from "../notificationRoute";

describe("notificationRoute", () => {
  it("opens an advertiser's campaign, ignoring cs-web's query string", () => {
    expect(notificationRoute("/campaigns/abc-123?tab=payments", "ADVERTISER")).toEqual({
      pathname: "/advertiser/campaigns/[id]",
      params: { id: "abc-123" },
    });
  });

  it("opens a partner's screen detail and screen list", () => {
    expect(notificationRoute("/my-screens/s-1?tab=availability", "SCREEN_PARTNER")).toEqual({
      pathname: "/partner/screens/[id]",
      params: { id: "s-1" },
    });
    expect(notificationRoute("/my-screens", "SCREEN_PARTNER")).toBe("/partner/screens");
  });

  it("sends KYC and dashboard links to the signed-in role's own screens", () => {
    expect(notificationRoute("/kyc", "SCREEN_PARTNER")).toBe("/partner/account/kyc");
    expect(notificationRoute("/kyc", "ADVERTISER")).toBe("/advertiser/account/kyc");
    expect(notificationRoute("/dashboard", "ADVERTISER")).toBe("/advertiser");
  });

  it("never routes one role into the other role's screens", () => {
    expect(notificationRoute("/campaigns/abc", "SCREEN_PARTNER")).toBe("/notifications");
    expect(notificationRoute("/my-screens/s-1", "ADVERTISER")).toBe("/notifications");
    expect(notificationRoute("/earnings", "ADVERTISER")).toBe("/notifications");
  });

  it("falls back to the inbox for missing, absolute and unknown links", () => {
    expect(notificationRoute(null, "ADVERTISER")).toBe("/notifications");
    expect(notificationRoute("https://bucket.example.com/report.csv", "ADVERTISER")).toBe("/notifications");
    expect(notificationRoute("/support/t-1", "SCREEN_PARTNER")).toBe("/notifications");
  });
});
