const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5050";

function getUserToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  // opts.headers istənilən formatda ola bilər: Headers | object | [][]
  const headers = new Headers(opts.headers);

  // JSON göndərdiyimiz üçün default content-type
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const msg = await res.json().catch(() => ({} as any));
    throw new Error(msg?.message || `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export async function apiAuth<T>(path: string, body: any) {
  return api<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export async function apiWithUser<T>(path: string, opts: RequestInit = {}) {
  const headers = new Headers(opts.headers);
  const token = getUserToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  return api<T>(path, { ...opts, headers });
}

export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("image", file);

  const res = await fetch(`${API_BASE}/api/upload/image`, {
    method: "POST",
    body: fd,
    cache: "no-store",
  });

  if (!res.ok) {
    const msg = await res.json().catch(() => ({}));
    throw new Error(msg?.message || `Upload failed (${res.status})`);
  }

  const data = (await res.json()) as { url: string };
  // backend relative url qaytarırsa full edək
  return data.url.startsWith("http") ? data.url : `${API_BASE}${data.url}`;
}
