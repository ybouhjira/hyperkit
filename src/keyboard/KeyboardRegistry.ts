import type { ShortcutConfig, ShortcutRegistration, ScopeEntry } from './types';
import { logger } from '../utils/logger';

let idCounter = 0;

function isMac(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
}

function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return true;
  if (target.isContentEditable) return true;
  return false;
}

function normalizeKey(key: string): string {
  return key.length === 1 ? key.toLowerCase() : key;
}

export class KeyboardRegistry {
  private registrations = new Map<string, ShortcutRegistration>();

  register(config: ShortcutConfig): string {
    const id = `kb-${++idCounter}`;
    const registration: ShortcutRegistration = { ...config, id };
    this.registrations.set(id, registration);

    if (import.meta.env.DEV) {
      this.checkConflicts(registration);
    }

    return id;
  }

  unregister(id: string): void {
    this.registrations.delete(id);
  }

  getAll(): ShortcutRegistration[] {
    return Array.from(this.registrations.values());
  }

  getByScope(scope: string): ShortcutRegistration[] {
    return this.getAll().filter((r) => (r.scope ?? 'global') === scope);
  }

  getByCategory(): Map<string, ShortcutRegistration[]> {
    const map = new Map<string, ShortcutRegistration[]>();
    for (const reg of this.registrations.values()) {
      const cat = reg.category ?? 'General';
      const list = map.get(cat) ?? [];
      list.push(reg);
      map.set(cat, list);
    }
    return map;
  }

  handleEvent(event: KeyboardEvent, activeScopes: ScopeEntry[]): void {
    const exclusiveScope = activeScopes.find((s) => s.exclusive);
    const eventKey = normalizeKey(event.key);
    const mac = isMac();

    for (const reg of this.registrations.values()) {
      const regScope = reg.scope ?? 'global';

      // Scope filtering: if an exclusive scope is active, only allow
      // shortcuts from that scope or the global scope
      if (exclusiveScope) {
        if (regScope !== 'global' && regScope !== exclusiveScope.name) {
          continue;
        }
      }

      // Input exclusion: skip if focused in input (except Escape)
      const excludeInputs = reg.excludeInputs ?? true;
      if (excludeInputs && eventKey.toLowerCase() !== 'escape' && isInputElement(event.target)) {
        continue;
      }

      // Key matching
      if (normalizeKey(reg.key) !== eventKey) continue;

      // Modifier matching (exact: if not specified, must be false)
      const wantCtrl = reg.mod ? !mac : false;
      const wantMeta = reg.mod ? mac : false;
      const expectCtrl = reg.ctrl || wantCtrl;
      const expectMeta = reg.meta || wantMeta;
      const expectShift = reg.shift ?? false;
      const expectAlt = reg.alt ?? false;

      if (event.ctrlKey !== expectCtrl) continue;
      if (event.metaKey !== expectMeta) continue;
      if (event.shiftKey !== expectShift) continue;
      if (event.altKey !== expectAlt) continue;

      // Match found
      event.preventDefault();
      reg.handler();
      return; // first match wins
    }
  }

  destroy(): void {
    this.registrations.clear();
  }

  private checkConflicts(newReg: ShortcutRegistration): void {
    for (const existing of this.registrations.values()) {
      if (existing.id === newReg.id) continue;
      if (
        normalizeKey(existing.key) === normalizeKey(newReg.key) &&
        (existing.scope ?? 'global') === (newReg.scope ?? 'global') &&
        !!existing.mod === !!newReg.mod &&
        !!existing.ctrl === !!newReg.ctrl &&
        !!existing.meta === !!newReg.meta &&
        !!existing.shift === !!newReg.shift &&
        !!existing.alt === !!newReg.alt
      ) {
        logger.warn(
          `[KeyboardService] Shortcut conflict: "${newReg.description}" conflicts with "${existing.description}" (${formatCombo(newReg)} in scope "${newReg.scope ?? 'global'}")`
        );
      }
    }
  }
}

function formatCombo(config: ShortcutConfig): string {
  const parts: string[] = [];
  if (config.mod) parts.push(isMac() ? '⌘' : 'Ctrl');
  if (config.ctrl) parts.push('Ctrl');
  if (config.meta) parts.push('⌘');
  if (config.shift) parts.push('Shift');
  if (config.alt) parts.push(isMac() ? '⌥' : 'Alt');
  parts.push(config.key);
  return parts.join('+');
}
