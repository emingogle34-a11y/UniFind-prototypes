import { describe, expect, it } from "vitest";
import {
  clearMasterKeyFailures,
  getMasterKeyLockSeconds,
  hashMasterKey,
  recordMasterKeyFailure,
  verifyMasterKey,
} from "./admin-auth";

describe("admin master key security", () => {
  it("verifies a scrypt hash without storing the plaintext key", async () => {
    const encoded = await hashMasterKey("correct-horse-battery-staple");

    expect(encoded).toMatch(/^scrypt\$/);
    await expect(verifyMasterKey("correct-horse-battery-staple", encoded)).resolves.toBe(true);
    await expect(verifyMasterKey("wrong-master-key", encoded)).resolves.toBe(false);
  });

  it("locks an IP after five failed attempts", () => {
    const ip = `test-${Date.now()}`;

    for (let index = 0; index < 5; index += 1) recordMasterKeyFailure(ip);
    expect(getMasterKeyLockSeconds(ip)).toBeGreaterThan(0);

    clearMasterKeyFailures(ip);
    expect(getMasterKeyLockSeconds(ip)).toBe(0);
  });
});
