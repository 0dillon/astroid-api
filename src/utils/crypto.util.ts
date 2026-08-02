import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Cryptographic helpers used for API keys, webhook signatures and refresh
 * tokens. Secrets are never stored in plaintext — only SHA-256 hashes.
 */

/** Generates a random URL-safe token of `bytes` entropy (hex-encoded). */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}

/** SHA-256 hex digest of a value — used to store non-reversible key hashes. */
export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Computes an HMAC-SHA256 signature (hex) for webhook payload signing. */
export function hmacSign(secret: string, payload: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

/** Constant-time comparison of two signatures to prevent timing attacks. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export interface GeneratedApiKey {
  /** The full secret shown to the user exactly once. */
  raw: string;
  /** The short prefix stored for identification (e.g. `ak_live_abcd`). */
  prefix: string;
  /** The SHA-256 hash persisted in the database. */
  hashedKey: string;
}

/** Mints a new API key: `ak_<env>_<random>`, returning raw + prefix + hash. */
export function generateApiKey(environment = 'live'): GeneratedApiKey {
  const secret = generateToken(24);
  const raw = `ak_${environment}_${secret}`;
  const prefix = raw.slice(0, 14);
  return { raw, prefix, hashedKey: sha256(raw) };
}
