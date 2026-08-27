import {
  DEFAULT_AUTH_RATE_LIMIT_MAX,
  readPositiveInteger,
} from "./rate-limit.config";

describe("rate-limit configuration", () => {
  it("accepts positive integer environment values", () => {
    expect(readPositiveInteger("25", DEFAULT_AUTH_RATE_LIMIT_MAX)).toBe(25);
  });

  it.each([undefined, "", "0", "-1", "1.5", "invalid"])(
    "uses the safe fallback for %p",
    (value) => {
      expect(readPositiveInteger(value, DEFAULT_AUTH_RATE_LIMIT_MAX)).toBe(
        DEFAULT_AUTH_RATE_LIMIT_MAX,
      );
    },
  );
});
