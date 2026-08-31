import { describe, expect, it } from "vitest";

import {
  isYouTubeUrl,
  parseYouTubeId,
  parseYouTubePlaylistId,
  parseYouTubePlaylistSourceUrl,
} from "./youtube";

describe("parseYouTubePlaylistId", () => {
  it.each([
    "https://www.youtube.com/playlist?list=PLI0Us89TC8PA",
    "https://m.youtube.com/watch?v=ebZj_nrmH-c&list=PLI0Us89TC8PA",
    "https://www.youtube.com/watch?v=ebZj_nrmH-c&list=PLI0Us89TC8PA",
    "https://music.youtube.com/playlist?list=PLI0Us89TC8PA",
    "youtube.com/playlist?list=PLI0Us89TC8PA",
    "PLI0Us89TC8PA",
  ])("extracts the valid short list ID from %s", (input) => {
    expect(parseYouTubePlaylistId(input)).toBe("PLI0Us89TC8PA");
  });

  it("does not enforce a minimum length (short IDs are valid)", () => {
    expect(parseYouTubePlaylistId("https://www.youtube.com/playlist?list=AB12CD34")).toBe(
      "AB12CD34",
    );
  });

  it("ignores unrelated query params and hosts", () => {
    expect(
      parseYouTubePlaylistId(
        "https://www.youtube.com/watch?v=abcDEFghIJK&list=RDCLAK5uy_km&index=2",
      ),
    ).toBe("RDCLAK5uy_km");
  });

  it("returns null when there is no list param", () => {
    expect(parseYouTubePlaylistId("https://www.youtube.com/watch?v=abcDEFghIJK")).toBeNull();
    expect(parseYouTubePlaylistId("")).toBeNull();
    expect(parseYouTubePlaylistId("   ")).toBeNull();
  });
});

describe("parseYouTubePlaylistSourceUrl", () => {
  it("normalises to a canonical playlist URL", () => {
    expect(
      parseYouTubePlaylistSourceUrl("https://m.youtube.com/watch?v=ebZj_nrmH-c&list=PLI0Us89TC8PA"),
    ).toBe("https://www.youtube.com/playlist?list=PLI0Us89TC8PA");
  });

  it("returns null for non-playlist urls", () => {
    expect(parseYouTubePlaylistSourceUrl("https://www.youtube.com/watch?v=abcDEFghIJK")).toBeNull();
  });
});

describe("parseYouTubeId", () => {
  it("extracts an 11-char video id", () => {
    expect(parseYouTubeId("https://www.youtube.com/watch?v=ebZj_nrmH-c&list=PLI0Us89TC8PA")).toBe(
      "ebZj_nrmH-c",
    );
  });
});

describe("isYouTubeUrl", () => {
  it("accepts playlist and watch urls", () => {
    expect(isYouTubeUrl("https://youtube.com/playlist?list=PLI0Us89TC8PA")).toBe(true);
    expect(isYouTubeUrl("https://music.youtube.com/playlist?list=PLI0Us89TC8PA")).toBe(true);
    expect(isYouTubeUrl("https://www.youtube.com/watch?v=ebZj_nrmH-c")).toBe(true);
  });
});
