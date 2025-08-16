'use client';
import { useEffect, useState } from 'react';
import { api, downloadFile } from '../../../lib/api';
import { useRouter } from 'next/navigation';

export default function StatusPage({ params }: { params: { id: string } }) {
  const [r, setR] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    setError(null);

    api(`/requests/${params.id}`)
      .then(data => {
        if (data?.request) {
          setR(data.request);
        } else {
          setError('Data permohonan tidak ditemukan');
        }
      })
      .catch((err) => {
        console.error('Error loading request:', err);
        if (err.message?.includes('Unauthorized') || err.message?.includes('Unauthenticated')) {
          setError('Silakan login terlebih dahulu untuk melihat status permohonan');
        } else {
          setError('Gagal memuat data permohonan. Silakan coba lagi.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id]);

  const step = (label: string, date?: string, done?: boolean) => (
    <div className="flex items-center gap-2">
      <input type="radio" readOnly checked={!!done} />
      <div className="text-xs">
        <div>{label}</div>
        {date && <div className="text-gray-400">{date}</div>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="py-6">
        <h1 className="text-xl font-semibold mb-4">Status Aplikasi Transkrip</h1>
        <p className="text-sm text-gray-500">Memuat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <h1 className="text-xl font-semibold mb-4">Status Aplikasi Transkrip</h1>
        <div className="card">
          <p className="text-red-600 text-sm">{error}</p>
          {error.includes('login') && (
            <button
              className="btn mt-4"
              onClick={() => router.push('/login')}
            >
              Login
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h1 className="text-xl font-semibold mb-4">Status Aplikasi Transkrip</h1>
      {!r ? <p className="text-sm text-gray-500">Memuat...</p> :
        <div className="space-y-6">
          <div className="card">
            <div className="space-y-2">
              {step('Pengajuan Diterima', r?.createdAt, true)}
              {step('Sedang Diproses', undefined, r.status !== 'SUBMITTED')}
              {step('Selesai', undefined, r.status === 'COMPLETED')}
            </div>
          </div>

          <div className="card">
            <div className="text-sm grid grid-cols-2 gap-6">
              <div>
                <div className="font-medium mb-2">Detail Permohonan</div>
                <div>ID Aplikasi: {r.id}</div>
                <div>Tanggal Pengajuan: {new Date(r.createdAt).toLocaleDateString()}</div>
                <div>Jenis Transkrip: {r.type}</div>
              </div>
              <div>
                <div className="font-medium mb-2">Informasi Pemohon</div>
                <div>Mata Kuliah: {r.course}</div>
                <div>Keperluan: {r.purpose}</div>
              </div>
            </div>
            {r.transcriptUrl && (
              <div className="mt-4">
                <button
                  className="btn"
                  onClick={async () => {
                    try {
                      await downloadFile(r.id, r.transcriptUrl);
                    } catch (error) {
                      console.error('Download failed:', error);
                      alert('Gagal mengunduh transkrip. Silakan coba lagi.');
                    }
                  }}
                >
                  Unduh Transkrip (Jika Tersedia)
                </button>
              </div>
            )}
          </div>
        </div>}
    </div>
  );
}
