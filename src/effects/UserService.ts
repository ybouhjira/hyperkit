import { Context, Effect } from 'effect';
import type { UserNotFoundError, UserAlreadyExistsError, InvalidInviteError } from './errors';

// ─── User Role System ────────────────────────────────────────────────────────
// Roles are hierarchical: admin > developer > tester > customer
// Each role inherits all permissions of roles below it.

export type UserRole = 'customer' | 'tester' | 'developer' | 'admin';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  customer: 0,
  tester: 1,
  developer: 2,
  admin: 3,
};

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly products: ReadonlyArray<string>;
  readonly createdAt: Date;
  readonly invitedBy?: string;
}

export interface RegisterParams {
  readonly email: string;
  readonly name: string;
  readonly inviteToken?: string;
}

export interface InviteLink {
  readonly token: string;
  readonly role: UserRole;
  readonly products: ReadonlyArray<string>;
  readonly createdBy: string;
  readonly expiresAt?: Date;
  readonly maxUses?: number;
  readonly uses: number;
}

export interface CreateInviteParams {
  readonly role: UserRole;
  readonly products: ReadonlyArray<string>;
  readonly createdBy: string;
  readonly expiresAt?: Date;
  readonly maxUses?: number;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export interface UserService {
  readonly register: (
    params: RegisterParams
  ) => Effect.Effect<User, UserAlreadyExistsError | InvalidInviteError>;
  readonly get: (id: string) => Effect.Effect<User, UserNotFoundError>;
  readonly getByEmail: (email: string) => Effect.Effect<User, UserNotFoundError>;
  readonly list: Effect.Effect<ReadonlyArray<User>>;
  readonly updateRole: (id: string, role: UserRole) => Effect.Effect<User, UserNotFoundError>;
  readonly addProduct: (id: string, product: string) => Effect.Effect<User, UserNotFoundError>;
  readonly removeProduct: (id: string, product: string) => Effect.Effect<User, UserNotFoundError>;
  readonly createInvite: (params: CreateInviteParams) => Effect.Effect<InviteLink>;
  readonly getInvite: (token: string) => Effect.Effect<InviteLink, InvalidInviteError>;
  readonly listInvites: Effect.Effect<ReadonlyArray<InviteLink>>;
}

export const UserService = Context.GenericTag<UserService>('UserService');
