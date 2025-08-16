'use client';
import { useState, useEffect } from 'react';
import FormField from '../../components/FormField';
import { api } from '../../lib/api';
import { useRouter } from 'next/navigation';

export default function RequestPage() {
  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [course, setCourse] = useState('');
  const [purpose, setPurpose] = useState('');
  const [type, setType] = useState('Ijazah & SKTL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    api('/auth/me')
      .then(response => {
        setUser(response.user);
        setLoading(false);
      })
      .catch(() => {
        setError('Silakan login terlebih dahulu untuk mengajukan permohonan');
        setLoading(false);
      });
  }, []);

  const submit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { request } = await api('/requests', { method: 'POST', body: JSON.stringify({ course, purpose, type }) });
      router.push(`/status/${request.id}`);
    } catch (err: any) {
      console.error('Error submitting request:', err);
      if (err.message?.includes('Unauthorized') || err.message?.includes('Unauthenticated')) {
        setError('Sesi Anda telah berakhir. Silakan login kembali.');
      } else {
        setError('Gagal mengajukan permohonan. Silakan coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
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
          <button
            className="btn mt-4"
            onClick={() => router.push('/login')}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-narrow py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ajukan Transkrip</h1>
          <p className="text-gray-600">Isi formulir di bawah untuk mengajukan permohonan transkrip</p>
        </div>

        <div className="card">
          {/* Type Selection Tabs */}
          <div className="mb-6">
            <label className="label">Jenis Transkrip</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setType('Ijazah & SKTL')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${type === 'Ijazah & SKTL'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
              >
                Ijazah & SKTL
              </button>
              <button
                type="button"
                onClick={() => setType('Hilang/Rusak/Legalisir')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${type === 'Hilang/Rusak/Legalisir'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
              >
                Hilang/Rusak/Legalisir
              </button>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <FormField label="Nama" required>
              <input
                className="input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                required
              />
            </FormField>

            <FormField label="NIM" required>
              <input
                className="input"
                value={nim}
                onChange={e => setNim(e.target.value)}
                placeholder="Masukkan NIM Anda"
                required
              />
            </FormField>

            <FormField label="Mata Kuliah yang Diulang" required>
              <input
                className="input"
                value={course}
                onChange={e => setCourse(e.target.value)}
                placeholder="Masukkan mata kuliah yang diulang"
                required
              />
            </FormField>

            <FormField label="Keperluan" required>
              <input
                className="input"
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                placeholder="Masukkan keperluan anda"
                required
              />
            </FormField>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="btn"
                disabled={submitting}
              >
                {submitting ? 'Mengajukan...' : 'Ajukan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
