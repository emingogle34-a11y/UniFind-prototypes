import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import type { Request } from "express";

const MAX_FAILURES = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const SCRYPT_KEY_LENGTH = 64;

type AttemptState = {
  failures: number;
  lockedUntil: number;
};

const attemptsByIp = new Map<string, AttemptState>();

function deriveKey(
  value: string,
  salt: Buffer,
  keyLength: number,
  options: { N: number; r: number; p: number },
) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(
      value,
      salt,
      keyLength,
      { ...options, maxmem: 64 * 1024 * 1024 },
      (error, derivedKey) => {
        if (error) reject(error);
        else resolve(derivedKey);
      },
    );
  });
}

export function getClientIp(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return raw?.trim() || req.ip || req.socket.remoteAddress || "unknown";
}

export function getMasterKeyLockSeconds(ip: string) {
  const attempt = attemptsByIp.get(ip);
  if (!attempt?.lockedUntil) return 0;

  const remaining = attempt.lockedUntil - Date.now();
  if (remaining <= 0) {
    attemptsByIp.delete(ip);
    return 0;
  }

  return Math.ceil(remaining / 1000);
}

export function recordMasterKeyFailure(ip: string) {
  const current = attemptsByIp.get(ip) ?? { failures: 0, lockedUntil: 0 };
  const failures = current.failures + 1;
  const lockedUntil = failures >= MAX_FAILURES ? Date.now() + LOCK_DURATION_MS : 0;
  attemptsByIp.set(ip, { failures, lockedUntil });
  return { failures, attemptsRemaining: Math.max(0, MAX_FAILURES - failures), lockedUntil };
}

export function clearMasterKeyFailures(ip: string) {
  attemptsByIp.delete(ip);
}

export async function verifyMasterKey(value: string, encodedHash: string) {
  const [algorithm, nValue, rValue, pValue, saltHex, hashHex] = encodedHash.split("$");
  if (algorithm !== "scrypt" || !nValue || !rValue || !pValue || !saltHex || !hashHex) {
    throw new Error("ADMIN_MASTER_KEY_HASH has an invalid format");
  }

  const expected = Buffer.from(hashHex, "hex");
  const salt = Buffer.from(saltHex, "hex");
  if (!expected.length || !salt.length) return false;

  const derived = await deriveKey(value, salt, expected.length, {
    N: Number(nValue),
    r: Number(rValue),
    p: Number(pValue),
  });

  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

export async function hashMasterKey(value: string) {
  const options = { N: 16384, r: 8, p: 1 };
  const salt = randomBytes(16);
  const derived = await deriveKey(value, salt, SCRYPT_KEY_LENGTH, options);
  return `scrypt$${options.N}$${options.r}$${options.p}$${salt.toString("hex")}$${derived.toString("hex")}`;
}
