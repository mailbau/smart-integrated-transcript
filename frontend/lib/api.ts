export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function getDownloadUrl(requestId: string, transcriptUrl?: string | null) {
  // Always get a fresh presigned URL from the backend
  // This ensures we always get the correct URL regardless of stored URL changes
  const res = await fetch(`${API_URL}/requests/${requestId}/download`, {
    credentials: "include" // if you use cookies/session
  });
  if (!res.ok) throw new Error("Failed to fetch download URL");
  const data = await res.json();
  return data.url;
}

export async function downloadFile(requestId: string, transcriptUrl?: string | null) {
  try {
    // Create a direct download link to the backend endpoint
    const downloadUrl = `${API_URL}/requests/${requestId}/download`;

    // Create a download link
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `transcript-${requestId}.pdf`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

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
