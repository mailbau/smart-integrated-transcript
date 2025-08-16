'use client';
import { useState } from 'react';
import FormField from '../../components/FormField';
import { api } from '../../lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const submit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, nim, dob, email, password })
      });

      // Update the global auth state
      login(response.user);

      router.push('/request');
    } catch (e: any) {
      setError('Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar</h1>
          <p className="text-gray-600">Buat akun baru untuk mulai mengajukan transkrip</p>
        </div>

        <div className="card">
          <form onSubmit={submit} className="space-y-6">
            <FormField label="Nama Lengkap" required>
              <input
                className="input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                required
              />
            </FormField>

            <FormField label="NIM" required>
              <input
                className="input"
                value={nim}
                onChange={e => setNim(e.target.value)}
                placeholder="Nomor Induk Mahasiswa"
                required
              />
            </FormField>

            <FormField label="Tanggal Lahir" required>
              <input
                className="input"
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Email" required>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
              />
            </FormField>

            <FormField label="Kata Sandi" required>
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                required
              />
            </FormField>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="btn w-full"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <a href="/login" className="link">
                Masuk sekarang
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
