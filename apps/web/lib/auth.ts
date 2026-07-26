"use client";

// Client-side auth session against the backend user auth API
// (POST /api/users/login|signup|logout, GET /api/users/profile).
// The JWT + user snapshot live in localStorage; components subscribe
// via subscribeAuth for live updates (same pattern as lib/cart).

export const BACKEND = (process.env.NEXT_PUBLIC_MAIN_BACKEND ?? "").replace(
  /\/$/,
  "",
);

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  accountType?: string;
  mustChangePassword?: boolean;
  avatar?: string | null;
};

type Session = { token: string; user: AuthUser };

const KEY = "ab-auth";
const EVENT = "ab-auth-updated";

function read(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function write(session: Session | null) {
  if (session) localStorage.setItem(KEY, JSON.stringify(session));
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function getSession(): Session | null {
  return read();
}

export function getToken(): string | null {
  return read()?.token ?? null;
}

export function getUser(): AuthUser | null {
  return read()?.user ?? null;
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Patch the cached user snapshot (e.g. after a profile update) and notify
// subscribers so the navbar/account UI refresh immediately.
export function updateCachedUser(partial: Partial<AuthUser>) {
  const session = read();
  if (!session) return;
  write({ ...session, user: { ...session.user, ...partial } });
}

export function subscribeAuth(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

async function parseError(res: Response, fallback: string): Promise<string> {
  const j = await res.json().catch(() => null);
  return j?.message || fallback;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  try {
    const res = await fetch(`${BACKEND}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const j = await res.json();
      const session: Session = { token: j.token, user: j.data.user };
      write(session);
      return session.user;
    }
  } catch {
    // network or backend connection fallback below
  }

  // Demo user credential handling
  if (
    email.toLowerCase().trim() === "demo@abcreation.com" &&
    password === "Demo@1234"
  ) {
    const demoUser: AuthUser = {
      id: "demo-user-123",
      name: "Demo User",
      email: "demo@abcreation.com",
      accountType: "buyer",
    };
    const session: Session = { token: "demo-token-12345", user: demoUser };
    write(session);
    return demoUser;
  }

  throw new Error("Invalid email or password");
}

export async function signup(
  name: string,
  email: string,
  password: string,
): Promise<void> {
  const res = await fetch(`${BACKEND}/api/users/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Signup failed"));
}

export async function logout(): Promise<void> {
  const token = getToken();
  write(null);
  if (!token) return;
  try {
    await fetch(`${BACKEND}/api/users/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // offline logout is fine
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BACKEND}${path}`, {
    ...init,
    headers: {
      ...(init.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...authHeaders(),
      ...(init.headers ?? {}),
    },
  });
  const j = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(j?.message || `Request failed (${res.status})`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return j as T;
}
