import type { ActionMiddleware, DispatchResult } from '../NavigableRegistry';

export type PermissionLevel = 'read' | 'write' | 'admin';

const PERMISSION_HIERARCHY: Record<PermissionLevel, number> = {
  read: 0,
  write: 1,
  admin: 2,
};

export interface PermissionMiddlewareOptions {
  getCallerPermission: (context: { target: string; action: string }) => PermissionLevel;
  getActionPermission?: (context: { target: string; action: string }) => PermissionLevel;
  onDenied?: (context: {
    target: string;
    action: string;
    required: PermissionLevel;
    actual: PermissionLevel;
  }) => void;
}

export interface PermissionMiddlewareHandle {
  /** The middleware function to pass to addActionMiddleware */
  middleware: ActionMiddleware;
  /** Set required permission level for a specific target + action */
  setPermission(target: string, action: string, level: PermissionLevel): void;
  /** Clear all permission entries in this instance */
  clearPermissions(): void;
}

// Default module-level map for backward-compatible standalone functions
const defaultPermissions = new Map<string, PermissionLevel>();

/** @deprecated Use the handle returned by createPermissionMiddleware() instead */
export function setActionPermission(target: string, action: string, level: PermissionLevel): void {
  defaultPermissions.set(`${target}.${action}`, level);
}

/** @deprecated Use the handle returned by createPermissionMiddleware() instead */
export function clearActionPermissions(): void {
  defaultPermissions.clear();
}

export function createPermissionMiddleware(
  options: PermissionMiddlewareOptions
): PermissionMiddlewareHandle {
  // Per-instance map — isolated from other createPermissionMiddleware calls
  const instancePermissions = new Map<string, PermissionLevel>();

  const middleware: ActionMiddleware = async (context, next): Promise<DispatchResult> => {
    const required = options.getActionPermission
      ? options.getActionPermission(context)
      : (instancePermissions.get(`${context.target}.${context.action}`) ??
        defaultPermissions.get(`${context.target}.${context.action}`) ??
        'read');
    const actual = options.getCallerPermission(context);

    if (PERMISSION_HIERARCHY[actual] < PERMISSION_HIERARCHY[required]) {
      options.onDenied?.({ ...context, required, actual });
      return {
        ok: false,
        error: `Permission denied: requires ${required}, caller has ${actual}`,
      };
    }

    return next();
  };

  return {
    middleware,
    setPermission(target: string, action: string, level: PermissionLevel): void {
      instancePermissions.set(`${target}.${action}`, level);
    },
    clearPermissions(): void {
      instancePermissions.clear();
    },
  };
}
