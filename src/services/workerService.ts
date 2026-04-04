import { auth } from "../firebase";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = async (): Promise<Record<string, string>> => {
  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      return { ...baseHeaders, Authorization: `Bearer ${token}` };
    } catch (err) {
      console.warn("Auth token error:", err);
      return baseHeaders;
    }
  }

  return new Promise<Record<string, string>>((resolve) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      resolve(baseHeaders);
    }, 1500);

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      clearTimeout(timeout);
      unsubscribe();
      if (!user) { resolve(baseHeaders); return; }
      try {
        const token = await user.getIdToken();
        resolve({ ...baseHeaders, Authorization: `Bearer ${token}` });
      } catch {
        resolve(baseHeaders);
      }
    });
  });
};

// ── GET ALL WORKERS ──
export const getWorkers = async () => {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_URL}/api/admin/workers`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch workers`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to fetch workers");
  return data.data;
};

// ── FLAG WORKER ──
export const flagWorker = async (id: string) => {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_URL}/api/admin/workers/${id}/flag`, {
    method: "PATCH",
    headers,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to flag worker`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to flag worker");
  return data;
};

// ── UNFLAG WORKER ──
export const unflagWorker = async (id: string) => {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_URL}/api/admin/workers/${id}/unflag`, {
    method: "PATCH",
    headers,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to unflag worker`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to unflag worker");
  return data;
};