export const API_BASE_URL =
  (import.meta.env.VITE_DEMO_LITE_API_BASE_URL as string | undefined) || '';

export async function apiFetch(path: string, init?: RequestInit) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  return res;
}

