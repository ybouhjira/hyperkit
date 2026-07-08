import { captureGlobalState, restoreGlobalState } from '../NavigableRegistry';
import type { AppStateSnapshot } from '../NavigableRegistry';

export function serializeGlobalState(): string {
  return JSON.stringify(captureGlobalState());
}

export function hydrateGlobalState(json: string | AppStateSnapshot): void {
  const snapshot = typeof json === 'string' ? (JSON.parse(json) as AppStateSnapshot) : json;
  restoreGlobalState(snapshot);
}
