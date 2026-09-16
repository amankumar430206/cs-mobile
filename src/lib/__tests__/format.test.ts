import { describe, expect, it } from "@jest/globals";
import { formatDuration, formatINR, formatRelativeTime, formatStorage, humanize, initialsOf, maskAccountNumber } from "../format";

describe("format helpers", () => {
  it("formats rupees, including Postgres numeric strings and junk", () => {
    expect(formatINR(125000)).toBe("₹1,25,000");
    expect(formatINR("2500.40")).toBe("₹2,500");
    expect(formatINR("not a number")).toBe("₹0");
  });

  it("humanizes API enum values", () => {
    expect(humanize("UNDER_REVIEW")).toBe("Under review");
    expect(humanize("ACTIVE")).toBe("Active");
  });

  it("formats durations and storage", () => {
    expect(formatDuration(42.4)).toBe("42s");
    expect(formatDuration(125)).toBe("2m 5s");
    expect(formatDuration(-3)).toBe("0s");
    expect(formatStorage(512)).toBe("512 MB");
    expect(formatStorage(2048)).toBe("2.0 GB");
  });

  it("describes recent times relative to now", () => {
    const now = Date.parse("2026-09-17T12:00:00Z");
    expect(formatRelativeTime("2026-09-17T11:59:30Z", now)).toBe("Just now");
    expect(formatRelativeTime("2026-09-17T11:15:00Z", now)).toBe("45m ago");
    expect(formatRelativeTime("2026-09-17T07:00:00Z", now)).toBe("5h ago");
    expect(formatRelativeTime("2026-09-14T12:00:00Z", now)).toBe("3d ago");
  });

  it("builds initials and masks account numbers", () => {
    expect(initialsOf("  asha   rao kumar ")).toBe("AR");
    expect(initialsOf("")).toBe("");
    expect(maskAccountNumber("00011122233")).toBe("•••• 2233");
  });
});
