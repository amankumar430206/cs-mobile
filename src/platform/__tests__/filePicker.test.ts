import { describe, expect, it, jest } from "@jest/globals";

// The native pickers are irrelevant to validation; stub them so the module loads under Jest.
jest.mock("expo-image-picker", () => ({}));
jest.mock("expo-document-picker", () => ({}));

// eslint-disable-next-line import/first
import { CREATIVE_LIMITS, FilePickError, PHOTO_LIMITS, VIDEO_LIMITS, validatePickedFile } from "../filePicker";

const MB = 1024 * 1024;
const file = (type: string, size?: number) => ({ uri: "file:///x", name: "x", type, size });

describe("validatePickedFile", () => {
  it("accepts a file within the type and size limits", () => {
    const picked = file("image/png", 2 * MB);
    expect(validatePickedFile(picked, PHOTO_LIMITS)).toBe(picked);
  });

  it("rejects a disallowed type with the limit's own message", () => {
    expect(() => validatePickedFile(file("application/pdf", MB), PHOTO_LIMITS)).toThrow(FilePickError);
    expect(() => validatePickedFile(file("application/pdf", MB), PHOTO_LIMITS)).toThrow(PHOTO_LIMITS.typeMessage);
  });

  it("rejects files over the size cap, but lets unknown sizes through to the API", () => {
    expect(() => validatePickedFile(file("image/jpeg", 6 * MB), PHOTO_LIMITS)).toThrow(PHOTO_LIMITS.sizeMessage);
    expect(validatePickedFile(file("image/jpeg"), PHOTO_LIMITS).size).toBeUndefined();
  });

  it("explains iPhone MOV rejections for screen videos, but accepts MOV creatives", () => {
    expect(() => validatePickedFile(file("video/quicktime", MB), VIDEO_LIMITS)).toThrow(/MOV/);
    expect(validatePickedFile(file("video/quicktime", 10 * MB), CREATIVE_LIMITS).type).toBe("video/quicktime");
  });
});
