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

export async function uploadExcelFile(requestId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/requests/${requestId}/upload-excel`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadTranscriptFile(requestId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/requests/${requestId}/upload-transcript`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getDownloadUrl(requestId: string): Promise<string> {
  const res = await fetch(`${API_URL}/requests/${requestId}/download`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.downloadUrl;
}

export async function downloadFile(requestId: string) {
  const downloadUrl = await getDownloadUrl(requestId);
  window.open(downloadUrl, '_blank');
}

// Debug function to check JWT configuration
export async function debugJwt() {
  const res = await fetch(`${API_URL.replace('/api', '')}/debug/jwt`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
