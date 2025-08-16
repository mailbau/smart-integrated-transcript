'use client';
import { useEffect, useState } from 'react';
import { api, apiUpload, downloadFile } from '../../../../lib/api';
import { useRouter } from 'next/navigation';

export default function AdminRequestDetail({ params }: { params: { id: string } }) {
  const [r, setR] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and is admin
    api('/auth/me')
      .then(response => {
        if (response.user.role !== 'ADMIN') {
          router.push('/login');
          return;
        }
        // Load request data using admin endpoint
        return api(`/requests/admin/${params.id}`);
      })
      .then(data => {
        if (data?.request) {
          setR(data.request);
        }
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id, router]);

  if (loading) {
    return <div className="py-6">Loading...</div>;
  }

  const upload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    await apiUpload(`/requests/${params.id}/upload`, form);
    const d = await api(`/requests/admin/${params.id}`);
    setR(d.request);
  }

  return (
    <div className="py-6">
      <h1 className="text-xl font-semibold mb-4">Detail Permohonan</h1>
      {!r ? <p>Memuat...</p> :
        <div className="card space-y-4">
          <div className="grid grid-cols-2 text-sm gap-6">
            <div>
              <div>Nama Pemohon</div>
              <div className="font-medium">{r.user?.name ?? '—'}</div>
              <div className="mt-2">Email</div>
              <div className="font-medium">{r.user?.email ?? '—'}</div>
            </div>
            <div>
              <div>Status</div>
              <div className="badge border-gray-300">{r.status}</div>
            </div>
          </div>
          <div>
            <div className="label mb-2">Unggah Transkrip Terverifikasi</div>
            <input className="input" type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
            <div className="mt-3 flex gap-2">
              <button className="btn" onClick={upload}>Kirim Transkrip</button>
            </div>
            {r.transcriptUrl && (
              <button
                className="link block mt-2"
                onClick={async () => {
                  try {
                    await downloadFile(r.id, r.transcriptUrl);
                  } catch (error) {
                    console.error('Download failed:', error);
                    alert('Gagal mengunduh transkrip. Silakan coba lagi.');
                  }
                }}
              >
                Buka file yang sudah diunggah
              </button>
            )}
          </div>
        </div>}
    </div>
  );
}
