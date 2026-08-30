export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: { id: string; email?: string };
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
const storageKey = "moex-qbr-session";

export const isSupabaseConfigured = Boolean(url && anonKey);

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  if (!url || !anonKey) throw new Error("Supabase не настроен");
  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token ?? anonKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.msg ?? body.message ?? body.error_description ?? body.error ?? "Ошибка запроса");
  return body as T;
}

export const authService = {
  session(): AuthSession | null {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(localStorage.getItem(storageKey) ?? "null"); } catch { return null; }
  },
  async signIn(login: string, password: string) {
    const email = login.includes("@") ? login : `${login}@qbr.local`;
    const session = await request<AuthSession>("/auth/v1/token?grant_type=password", {
      method: "POST", body: JSON.stringify({ email, password }),
    });
    session.expires_at = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem(storageKey, JSON.stringify(session));
    return session;
  },
  async signOut() {
    const session = this.session();
    if (session) await request("/auth/v1/logout", { method: "POST" }, session.access_token).catch(() => undefined);
    localStorage.removeItem(storageKey);
  },
};

export async function loadWorkspaceState<T>(): Promise<T | null> {
  const session = authService.session();
  if (!session) return null;
  const rows = await request<Array<{ state: T }>>("/rest/v1/qbr_app_state?select=state&limit=1", {}, session.access_token);
  return rows[0]?.state ?? null;
}

export async function saveWorkspaceState(state: unknown) {
  const session = authService.session();
  if (!session) return;
  await request("/rest/v1/qbr_app_state?on_conflict=user_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ user_id: session.user.id, state, updated_at: new Date().toISOString() }),
  }, session.access_token);
}

export async function runAiAnalysis(year: number, quarter: number) {
  const session = authService.session();
  if (!session) throw new Error("Требуется вход");
  const periods = await request<Array<{ id: string }>>(
    `/rest/v1/qbr_periods?select=id&year=eq.${year}&quarter=eq.${quarter}&limit=1`,
    {},
    session.access_token,
  );
  const periodId = periods[0]?.id;
  if (!periodId) throw new Error("Период QBR не найден в Supabase");
  return request<{ result: unknown }>("/functions/v1/ai-qbr-analysis", {
    method: "POST", body: JSON.stringify({ periodId }),
  }, session.access_token);
}
