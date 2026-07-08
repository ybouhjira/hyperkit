import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  onMount,
  type ParentProps,
  type Accessor,
} from 'solid-js';
import type { User, UserRole } from '../../effects/UserService';
import { hasRole } from '../../effects/UserService';

// ─── Storage Adapter ─────────────────────────────────────────────────────────
// Same pattern as Inspector: pluggable storage, swap without touching UI.

export interface UserStorage {
  getCurrentUser(): Promise<User | null>;
  register(email: string, name: string, inviteToken?: string): Promise<User>;
  login(email: string): Promise<User>;
  logout(): Promise<void>;
  subscribe?(callback: (user: User | null) => void): () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

export interface UserContextValue {
  user: Accessor<User | null>;
  loading: Accessor<boolean>;
  register: (email: string, name: string, inviteToken?: string) => Promise<User>;
  login: (email: string) => Promise<User>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isAuthenticated: () => boolean;
}

const UserContext = createContext<UserContextValue>();

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>');
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export interface UserProviderProps extends ParentProps {
  storage: UserStorage;
}

export function UserProvider(props: UserProviderProps) {
  const [user, setUser] = createSignal<User | null>(null);
  const [loading, setLoading] = createSignal(true);

  onMount(() => {
    void props.storage
      .getCurrentUser()
      .then((current) => setUser(current))
      .finally(() => setLoading(false));
  });

  // Subscribe to external changes (e.g., another tab, WebSocket)
  createEffect(() => {
    const unsub = props.storage.subscribe?.((u) => setUser(u));
    return unsub;
  });

  const ctx: UserContextValue = {
    user,
    loading,
    register: async (email, name, inviteToken?) => {
      const u = await props.storage.register(email, name, inviteToken);
      setUser(u);
      return u;
    },
    login: async (email) => {
      const u = await props.storage.login(email);
      setUser(u);
      return u;
    },
    logout: async () => {
      await props.storage.logout();
      setUser(null);
    },
    hasRole: (role: UserRole) => {
      const u = user();
      return u !== null && hasRole(u.role, role);
    },
    isAuthenticated: () => user() !== null,
  };

  return <UserContext.Provider value={ctx}>{props.children}</UserContext.Provider>;
}

// ─── RoleGate ────────────────────────────────────────────────────────────────
// Only renders children if the current user has the required role.

export interface RoleGateProps extends ParentProps {
  role: UserRole;
  fallback?: () => import('solid-js').JSX.Element;
}

export function RoleGate(props: RoleGateProps) {
  const { hasRole: userHasRole, loading } = useUser();

  return <>{!loading() && userHasRole(props.role) ? props.children : props.fallback?.()}</>;
}

// ─── LicenseGate ─────────────────────────────────────────────────────────────
// Generalized license gate — checks if user has access to a specific product.

export interface LicenseGateProps extends ParentProps {
  product: string;
  fallback?: () => import('solid-js').JSX.Element;
}

export function LicenseGate(props: LicenseGateProps) {
  const { user, loading } = useUser();

  const hasAccess = () => {
    const u = user();
    if (!u) return false;
    return u.products.includes(props.product) || hasRole(u.role, 'admin');
  };

  return <>{!loading() && hasAccess() ? props.children : props.fallback?.()}</>;
}

// ─── Storage Adapters ────────────────────────────────────────────────────────

export function createLocalUserStorage(key: string): UserStorage {
  const storageKey = `sk-user-${key}`;

  return {
    getCurrentUser() {
      const raw = localStorage.getItem(storageKey);
      return Promise.resolve(raw ? (JSON.parse(raw) as User) : null);
    },
    register(email, name, _inviteToken?) {
      const user: User = {
        id: crypto.randomUUID?.() ?? Date.now().toString(36),
        email: email.toLowerCase().trim(),
        name,
        role: 'customer',
        products: [],
        createdAt: new Date(),
      };
      localStorage.setItem(storageKey, JSON.stringify(user));
      return Promise.resolve(user);
    },
    login(email) {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return Promise.reject(new Error('User not found'));
      const user = JSON.parse(raw) as User;
      if (user.email !== email.toLowerCase().trim())
        return Promise.reject(new Error('Email mismatch'));
      return Promise.resolve(user);
    },
    logout() {
      localStorage.removeItem(storageKey);
      return Promise.resolve();
    },
  };
}

export function createApiUserStorage(baseUrl: string): UserStorage {
  const headers = { 'Content-Type': 'application/json' };

  return {
    async getCurrentUser() {
      const token = localStorage.getItem('sk-auth-token');
      if (!token) return null;
      const res = await fetch(`${baseUrl}/api/user/me`, {
        headers: { ...headers, Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return res.json() as Promise<User>;
    },
    async register(email, name, inviteToken?) {
      const res = await fetch(`${baseUrl}/api/user/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, name, inviteToken }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { user: User; token: string };
      localStorage.setItem('sk-auth-token', data.token);
      return data.user;
    },
    async login(email) {
      const res = await fetch(`${baseUrl}/api/user/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { user: User; token: string };
      localStorage.setItem('sk-auth-token', data.token);
      return data.user;
    },
    logout() {
      localStorage.removeItem('sk-auth-token');
      return Promise.resolve();
    },
  };
}

export function createMemoryUserStorage(): UserStorage & { users: User[] } {
  const users: User[] = [];
  const listeners: Array<(user: User | null) => void> = [];
  let current: User | null = null;

  return {
    users,
    getCurrentUser() {
      return Promise.resolve(current);
    },
    register(email, name) {
      const user: User = {
        id: Date.now().toString(36),
        email: email.toLowerCase().trim(),
        name,
        role: 'customer',
        products: [],
        createdAt: new Date(),
      };
      users.push(user);
      current = user;
      listeners.forEach((l) => l(user));
      return Promise.resolve(user);
    },
    login(email) {
      const user = users.find((u) => u.email === email.toLowerCase().trim());
      if (!user) return Promise.reject(new Error('User not found'));
      current = user;
      listeners.forEach((l) => l(user));
      return Promise.resolve(user);
    },
    logout() {
      current = null;
      listeners.forEach((l) => l(null));
      return Promise.resolve();
    },
    subscribe(callback) {
      listeners.push(callback);
      return () => {
        const idx = listeners.indexOf(callback);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    },
  };
}
