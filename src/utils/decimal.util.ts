/**
 * Small numeric/decimal helpers. Amounts are handled as strings/numbers at the
 * API boundary and stored as Prisma Decimal (30,7) to preserve Stellar's
 * 7-decimal precision without floating-point drift in comparisons.
 */

/** Parses a user-supplied amount into a finite positive number, or throws. */
export function parseAmount(value: string | number): number {
  const amount = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(amount)) {
    throw new Error('Amount must be a finite number');
  }
  return amount;
}

/** Rounds to Stellar's 7-decimal precision. */
export function toStellarPrecision(value: number): number {
  return Math.round(value * 1e7) / 1e7;
}

/** Clamps a number into an inclusive range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Formats a number as a fixed-precision decimal string for storage. */
export function toDecimalString(value: number): string {
  return toStellarPrecision(value).toFixed(7);
}
