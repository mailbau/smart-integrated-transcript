export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';



export async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiUpload(path: string, form: FormData) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: form
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTemplateLink(): Promise<string | null> {
  const res = await fetch(`${API_URL}/settings/template-link`, {
    credentials: 'include'
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.templateLink || null;
}
