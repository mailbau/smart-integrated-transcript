'use client';
import { useState } from 'react';
import FormField from '../../components/FormField';
import { api } from '../../lib/api';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const submit = async (e: any) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      // Check user role and redirect accordingly
      if (response.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/request');
      }
    } catch (e: any) {
      setError('Email atau kata sandi salah');
    }
  };

  return (
    <div className="container-narrow py-10">
      <h1 className="text-center text-lg font-semibold mb-6">Masuk</h1>
      <form onSubmit={submit} className="card">
        <FormField label="Email">
          <input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" />
        </FormField>
        <FormField label="Kata Sandi">
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 8 karakter" />
        </FormField>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <button className="btn w-full">Masuk</button>
        <p className="text-center text-xs text-gray-500 mt-2">Belum punya akun? <a className="link" href="/register">Daftar</a></p>
      </form>
    </div>
  );
}
