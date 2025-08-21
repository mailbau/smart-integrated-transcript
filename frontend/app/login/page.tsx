'use client';
import { useState } from 'react';
import FormField from '../../components/FormField';
import { api } from '../../lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
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
      const response = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

      // Update the global auth state
      login(response.user);

      // Check user role and redirect accordingly
      if (response.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/request');
      }
    } catch (e: any) {
      // Handle specific error messages from backend
      if (e.message) {
        if (e.message.includes('Invalid credentials')) {
          setError('Email atau kata sandi salah. Silakan periksa kembali kredensial Anda.');
        } else {
          setError(e.message);
        }
      } else {
        setError('Gagal masuk. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">Masuk</h1>
          <p className="text-blue-700">Masuk ke akun Anda untuk melanjutkan</p>
        </div>

        <div className="card">
          <form onSubmit={submit} className="space-y-6">
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
              <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl p-4 shadow-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn w-full"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-blue-700">
              Belum punya akun?{' '}
              <a href="/register" className="link">
                Daftar sekarang
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
