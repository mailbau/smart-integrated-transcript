'use client';
import { useEffect, useState } from 'react';
import { api, getTemplateLink as fetchTemplateLink, uploadExcelFile, downloadFile } from '../../../lib/api';
import { useRouter } from 'next/navigation';

export default function StatusPage({ params }: { params: { id: string } }) {
  const [r, setR] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [excelLink, setExcelLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [templateLink, setTemplateLink] = useState<string | null>(null);
  const [excelSubmitted, setExcelSubmitted] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      api(`/requests/${params.id}`),
      fetchTemplateLink()
    ])
      .then(([data, tmpl]) => {
        if (data?.request) {
          setR(data.request);
          setExcelLink(data.request.excelLink || '');
          setExcelSubmitted(!!data.request.excelLink);
        } else {
          setError('Data permohonan tidak ditemukan');
        }
        setTemplateLink(tmpl);
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

  const submitExcelLink = async () => {
    try {
      setSaving(true);
      await api(`/requests/${params.id}/excel-link`, { method: 'POST', body: JSON.stringify({ excelLink: 'submitted_via_form' }) });
      const d = await api(`/requests/${params.id}`);
      setR(d.request);
      setExcelSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadingFile(true);
      await uploadExcelFile(params.id, selectedFile);
      const d = await api(`/requests/${params.id}`);
      setR(d.request);
      setExcelSubmitted(true);
      setSelectedFile(null);
    } catch (e: any) {
      console.error('Upload error:', e);
      alert('Gagal mengunggah file. Silakan coba lagi.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const getTimelineSteps = (status: string) => {
    const steps = [
      { id: 'submitted', label: 'Pengajuan Diterima', completed: true, date: r?.createdAt },
      { id: 'processing', label: 'Sedang Diproses', completed: status !== 'SUBMITTED', date: r?.underReviewAt },
      { id: 'approved', label: 'Verifikasi Diajukan', completed: status === 'APPROVED' || status === 'COMPLETED', date: r?.approvedAt },
      { id: 'completed', label: 'Selesai', completed: status === 'COMPLETED', date: r?.completedAt }
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
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Status Aplikasi Transkrip</h1>
          <p className="text-gray-600">Detail status permohonan #{r.id.slice(-8)}</p>
        </div>

        {/* Timeline */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Progress Permohonan</h2>
          <div className="timeline">
            {timelineSteps.map((step) => (
              <div key={step.id} className="timeline-item">
                <div className={`timeline-dot ${step.completed ? 'completed' : 'pending'}`}></div>
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

        {/* Admin links: source and template - only show from UNDER_REVIEW onwards */}
        {(r.sourceLink || templateLink) && r.status !== 'SUBMITTED' && (
          <div className="card">
            <p className="text-sm text-gray-600 mb-3">Silahkan pindahkan data ke template yang disediakan.</p>
            <div className="space-y-4">
              {r.sourceLink && (
                <div>
                  <div className="font-medium mb-2">Tautan Sumber Data dari Admin</div>
                  <a
                    className="btn block text-center"
                    href={r.sourceLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Buka Tautan Sumber Data
                  </a>
                </div>
              )}
              {templateLink && (
                <div>
                  <div className="font-medium mb-2">Template Transkrip Nilai</div>
                  <a
                    className="btn-secondary block text-center"
                    href={templateLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Unduh Template Excel
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Excel file upload - show when UNDER_REVIEW or APPROVED (before COMPLETED) */}
        {(r.status === 'UNDER_REVIEW' || r.status === 'APPROVED') && (
          <div className="card">
            <div className="font-semibold mb-2">Unggah File Excel</div>
            <p className="text-sm text-gray-600 mb-3">Upload file Excel yang telah diisi sesuai template.</p>
            <div className="space-y-4">
              {excelSubmitted ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                  <p className="text-sm text-green-700 font-medium">
                    ✓ Berhasil! File Excel telah diunggah
                  </p>
                  {r.excelLink && (
                    <a
                      href={r.excelLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary mt-2 block text-center"
                    >
                      Lihat File Excel
                    </a>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <button
                    className="btn-success w-full"
                    onClick={handleFileUpload}
                    disabled={uploadingFile || !selectedFile}
                  >
                    {uploadingFile ? 'Mengunggah...' : 'Upload File Excel'}
                  </button>
                </div>
              )}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Pengingat:</strong> Silahkan hubungi kembali admin SIA prodi setelah mengunggah Excel.
                </p>
              </div>
            </div>
          </div>
        )}

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
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">
                  <span className={`badge ${r.status === 'COMPLETED' ? 'border-green-300 bg-green-50 text-green-700' :
                    r.status === 'UNDER_REVIEW' ? 'border-yellow-300 bg-yellow-50 text-yellow-700' :
                      r.status === 'APPROVED' ? 'border-blue-300 bg-blue-50 text-blue-700' :
                        'border-blue-300 bg-blue-50 text-blue-700'
                    }`}>
                    {r.status === 'COMPLETED' ? 'Selesai' :
                      r.status === 'UNDER_REVIEW' ? 'Sedang Diproses' :
                        r.status === 'APPROVED' ? 'Sheet Diunggah Pengguna' :
                          r.status === 'SUBMITTED' ? 'Diajukan' : r.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {r.status === 'COMPLETED' && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-center">
                <div className="font-medium text-green-800 mb-2">Transkrip Telah Diverifikasi</div>
                <p className="text-sm text-green-700 mb-3">
                  Transkrip yang telah diverifikasi dapat diunduh di bawah ini:
                </p>
                <button
                  onClick={() => downloadFile(r.id)}
                  className="btn-success"
                >
                  Unduh Transkrip
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
