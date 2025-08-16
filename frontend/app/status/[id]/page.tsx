'use client';
import { useEffect, useState } from 'react';
import { api, downloadFile } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

  const getTimelineSteps = (status: string) => {
    const steps = [
      { id: 'submitted', label: 'Pengajuan Diterima', completed: true, date: r?.createdAt },
      { id: 'processing', label: 'Sedang Diproses', completed: status !== 'SUBMITTED', date: null },
      { id: 'completed', label: 'Selesai', completed: status === 'COMPLETED', date: null }
    ];
    return steps;
  };

  if (loading) {
    return (
      <div className="container-narrow py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-narrow py-8">
        <div className="card text-center">
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

  if (!r) {
    return (
      <div className="container-narrow py-8">
        <div className="card text-center">
          <p className="text-gray-600">Data tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const timelineSteps = getTimelineSteps(r.status);

  return (
    <div className="container-narrow py-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/status"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Status Aplikasi
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Status Aplikasi Transkrip</h1>
          <p className="text-gray-600">Detail status permohonan #{r.id.slice(-8)}</p>
        </div>

        <div className="space-y-6">
          {/* Timeline */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Progress Permohonan</h2>
            <div className="timeline">
              {timelineSteps.map((step, index) => (
                <div key={step.id} className="timeline-item">
                  <div className={`timeline-dot ${step.completed ? 'completed' : 'pending'}`}>
                    {step.completed && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">{step.label}</div>
                    {step.date && (
                      <div className="timeline-date">
                        {new Date(step.date).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Request Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Detail Permohonan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">ID Aplikasi</label>
                  <p className="text-sm text-gray-900 font-mono">{r.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Tanggal Pengajuan</label>
                  <p className="text-sm text-gray-900">
                    {new Date(r.createdAt).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Jenis Transkrip</label>
                  <p className="text-sm text-gray-900">{r.type}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Mata Kuliah</label>
                  <p className="text-sm text-gray-900">{r.course}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Keperluan</label>
                  <p className="text-sm text-gray-900">{r.purpose}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <span className={`badge ${r.status === 'COMPLETED' ? 'border-green-300 bg-green-50 text-green-700' :
                      r.status === 'UNDER_REVIEW' ? 'border-yellow-300 bg-yellow-50 text-yellow-700' :
                        'border-blue-300 bg-blue-50 text-blue-700'
                      }`}>
                      {r.status === 'COMPLETED' ? 'Selesai' :
                        r.status === 'UNDER_REVIEW' ? 'Sedang Diproses' :
                          r.status === 'SUBMITTED' ? 'Diajukan' : r.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Download Section */}
          {r.transcriptUrl && (
            <div className="card text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Transkrip Siap Diunduh</h3>
              <p className="text-gray-600 mb-6">Transkrip Anda telah selesai diproses dan siap diunduh</p>
              <button
                className="btn-success"
                onClick={async () => {
                  try {
                    await downloadFile(r.id, r.transcriptUrl);
                  } catch (error) {
                    console.error('Download failed:', error);
                    alert('Gagal mengunduh transkrip. Silakan coba lagi.');
                  }
                }}
              >
                Unduh Transkrip
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Link href="/status" className="btn-secondary">
              Kembali ke Daftar
            </Link>
            <Link href="/request" className="btn">
              Ajukan Transkrip Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
