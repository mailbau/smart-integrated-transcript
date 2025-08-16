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
    }
  };

  if (loading) {
    return (
      <div className="py-6">
        <h1 className="text-xl font-semibold mb-4">Ajukan Transkrip</h1>
        <p className="text-sm text-gray-500">Memuat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <h1 className="text-xl font-semibold mb-4">Ajukan Transkrip</h1>
        <div className="card">
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
    <div className="py-6">
      <h1 className="text-xl font-semibold mb-4">Ajukan Transkrip</h1>
      <div className="card">
        <div className="mb-4 text-sm">
          <div className="flex gap-4">
            <button className={"badge " + (type === 'Ijazah & SKTL' ? 'border-gray-800' : 'border-gray-300')} onClick={() => setType('Ijazah & SKTL')}>Ijazah & SKTL</button>
            <button className={"badge " + (type !== 'Ijazah & SKTL' ? 'border-gray-800' : 'border-gray-300')} onClick={() => setType('Hilang/Rusak/Legalisir')}>Hilang/Rusak/Legalisir</button>
          </div>
        </div>
        <form onSubmit={submit}>
          <FormField label="Nama">
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Masukkan nama lengkap Anda" />
          </FormField>
          <FormField label="NIM">
            <input className="input" value={nim} onChange={e => setNim(e.target.value)} placeholder="Masukkan NIM Anda" />
          </FormField>
          <FormField label="Mata Kuliah yang Diulang">
            <input className="input" value={course} onChange={e => setCourse(e.target.value)} placeholder="Masukkan mata kuliah yang diulang" />
          </FormField>
          <FormField label="Keperluan">
            <input className="input" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Masukkan keperluan anda" />
          </FormField>
          <div className="text-right">
            <button className="btn">Ajukan</button>
          </div>
        </form>
      </div>
    </div>
  );
}
