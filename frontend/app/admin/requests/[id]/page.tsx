'use client';
import { useEffect, useState } from 'react';
import { api, getTemplateLink as fetchTemplateLink } from '../../../../lib/api';
import { useRouter } from 'next/navigation';

export default function AdminRequestDetail({ params }: { params: { id: string } }) {
  const [r, setR] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sourceLink, setSourceLink] = useState('');
  const [templateLink, setTemplateLink] = useState<string | null>(null);
  const [templateDraft, setTemplateDraft] = useState('');
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check admin & load
    (async () => {
      try {
        const me = await api('/auth/me');
        if (me.user.role !== 'ADMIN') return router.push('/login');
        const [reqData, tmpl] = await Promise.all([
          api(`/requests/admin/${params.id}`),
          fetchTemplateLink()
        ]);
        if (reqData?.request) {
          setR(reqData.request);
          setSourceLink(reqData.request.sourceLink || '');
          setVerified(reqData.request.status === 'COMPLETED');
        }
        setTemplateLink(tmpl);
        setTemplateDraft(tmpl || '');
      } catch (e) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, router]);

  if (loading) return <div className="py-6">Loading...</div>;

  const verifyTranscript = async () => {
    try {
      setSaving(true);
      await api(`/requests/${params.id}/verify`, { method: 'POST' });
      const d = await api(`/requests/admin/${params.id}`);
      setR(d.request);
      setVerified(true);
    } finally {
      setSaving(false);
    }
  };

  const setLink = async () => {
    if (!sourceLink) return;
    try {
      setSaving(true);
      await api(`/requests/${params.id}/source-link`, { method: 'POST', body: JSON.stringify({ sourceLink }) });
      const d = await api(`/requests/admin/${params.id}`);
      setR(d.request);
    } finally {
      setSaving(false);
    }
  };

  const saveTemplate = async () => {
    if (!templateDraft) return;
    try {
      setSaving(true);
      await api('/settings/template-link', { method: 'POST', body: JSON.stringify({ templateLink: templateDraft }) });
      setTemplateLink(templateDraft);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-narrow py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Detail Permohonan</h1>

        {/* Global: Template link configuration */}
        <div className="card space-y-3">
          <div className="font-medium">Tautan Template Excel (Global)</div>
          <p className="text-sm text-gray-600">Tautan ini digunakan oleh semua permohonan. Ubah jika perlu.</p>
          <div className="flex gap-2 items-center">
            <input className="input flex-1" placeholder="https://..." value={templateDraft} onChange={e => setTemplateDraft(e.target.value)} />
            <button className="btn" onClick={saveTemplate} disabled={saving || !templateDraft}>Simpan</button>
            {templateLink && <a className="btn-secondary" href={templateLink} target="_blank" rel="noreferrer">Buka Template</a>}
          </div>
        </div>

        {/* Admin: source data link */}
        <div className="card space-y-3">
          <div className="font-medium">Input Tautan Sumber Data</div>
          <p className="text-sm text-gray-600">Masukkan tautan sumber data. Mengirim tautan akan mengubah status menjadi Sedang Diproses.</p>
          <div className="flex gap-2 items-center">
            <input
              className="input flex-1"
              placeholder="https://..."
              value={sourceLink}
              onChange={e => setSourceLink(e.target.value)}
            />
            <button className="btn" onClick={setLink} disabled={saving || !sourceLink}>Simpan</button>
            {r?.sourceLink && (
              <a className="btn-secondary" href={r.sourceLink} target="_blank" rel="noreferrer">Buka</a>
            )}
          </div>
          {r?.status && (
            <div className="text-sm text-gray-500">Status saat ini: {r.status}</div>
          )}
        </div>

        {/* User excel submission notification */}
        <div className="card space-y-2">
          <div className="font-medium">Status Pengumpulan Excel</div>
          {r?.excelLink ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>✓ Pengguna telah mengisi form pengumpulan Excel</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Status: {r.status === 'APPROVED' ? 'Sheet Diunggah Pengguna' : 'Sedang Diproses'}
              </p>
            </div>
          ) : (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                <strong>⚠ Pengguna belum mengisi form pengumpulan Excel</strong>
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Status: Menunggu pengguna mengisi form
              </p>
            </div>
          )}
        </div>

        {/* Verification section */}
        <div className="card space-y-4">
          <div className="font-medium">Verifikasi Transkrip</div>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Admin akan mengunggah transkrip terverifikasi ke Google Drive. Klik tautan di bawah untuk mengakses folder upload.
            </p>
            <a
              href="https://bit.ly/3TDKZFn"
              target="_blank"
              rel="noreferrer"
              className="btn block text-center"
            >
              Buka Folder Upload Google Drive
            </a>
            {verified ? (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-sm text-green-700 font-medium">
                  ✓ Transkrip telah diverifikasi dan permohonan selesai
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Status: Selesai
                </p>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700 mb-3">
                  <strong>Penting:</strong> Setelah mengunggah transkrip ke Google Drive, klik tombol verifikasi di bawah untuk menandai permohonan sebagai selesai.
                </p>
                <button
                  className="btn-success w-full"
                  onClick={verifyTranscript}
                  disabled={saving}
                >
                  {saving ? 'Memverifikasi...' : 'Verifikasi Transkrip (Tandai Selesai)'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
