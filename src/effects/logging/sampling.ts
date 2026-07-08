/**
 * Session-based sampling decision. Called once at layer creation time.
 * Returns `true` if this session should emit to external transports.
 *
 * - rate = 0 → always false (no external logging)
 * - rate = 1 → always true (full logging)
 * - rate = 0.1 → ~10% of sessions log externally
 *
 * Memory transport is always active regardless of sampling.
 */
export const shouldSample = (rate: number): boolean => {
  if (rate <= 0) return false;
  if (rate >= 1) return true;
  return Math.random() < rate;
};
