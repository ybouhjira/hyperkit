import { Context, Effect } from 'effect';
import type { LicenseNotFoundError, LicenseInvalidError, UserNotFoundError } from './errors';

// ─── Types ───────────────────────────────────────────────────────────────────

export type LicenseStatus = 'active' | 'expired' | 'revoked' | 'trial';

export interface License {
  readonly id: string;
  readonly userId: string;
  readonly product: string;
  readonly key: string;
  readonly status: LicenseStatus;
  readonly createdAt: Date;
  readonly expiresAt?: Date;
}

export interface GenerateLicenseParams {
  readonly userId: string;
  readonly product: string;
  readonly expiresAt?: Date;
}

// ─── Key Generation ──────────────────────────────────────────────────────────
// Deterministic: SHA256(salt + email.lower().trim()) → first 8 bytes → hex → 4 groups
// Produces: PDFLY-XXXX-XXXX-XXXX-XXXX (or any product prefix)
// Same email always generates the same key for the same product.

export function generateLicenseKey(_email: string, _product: string, _salt: string): string {
  // This is the sync key derivation formula.
  // In browser: use SubtleCrypto. In Node: use crypto.createHash.
  // The service implementation provides the actual hashing.
  // This function signature documents the contract.
  throw new Error('Use LicenseService.generate() — this is the contract definition');
}

// ─── Service ─────────────────────────────────────────────────────────────────

export interface LicenseService {
  readonly generate: (params: GenerateLicenseParams) => Effect.Effect<License, UserNotFoundError>;
  readonly validate: (key: string, product: string) => Effect.Effect<License, LicenseInvalidError>;
  readonly get: (userId: string, product: string) => Effect.Effect<License, LicenseNotFoundError>;
  readonly revoke: (userId: string, product: string) => Effect.Effect<void, LicenseNotFoundError>;
  readonly listForUser: (userId: string) => Effect.Effect<ReadonlyArray<License>>;
  readonly listForProduct: (product: string) => Effect.Effect<ReadonlyArray<License>>;
}

export const LicenseService = Context.GenericTag<LicenseService>('LicenseService');
