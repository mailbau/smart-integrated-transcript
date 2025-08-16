'use client';
import { useState } from 'react';
import FormField from '../../components/FormField';
import { api } from '../../lib/api';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const submit = async (e: any) => {
    e.preventDefault();
    await api('/auth/register', { method: 'POST', body: JSON.stringify({ name, nim, dob, email, password }) });
    router.push('/request');
  };

  return (
    <div className="container-narrow py-10">
      <h1 className="text-center text-lg font-semibold mb-6">Daftar</h1>
      <form onSubmit={submit} className="card">
        <FormField label="Nama">
          <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Nama Lengkap" />
        </FormField>
        <FormField label="NIM">
          <input className="input" value={nim} onChange={e=>setNim(e.target.value)} placeholder="Nomor Induk Mahasiswa" />
        </FormField>
        <FormField label="Tanggal Lahir">
          <input className="input" value={dob} onChange={e=>setDob(e.target.value)} placeholder="YYYY-MM-DD" />
        </FormField>
        <FormField label="Email">
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@email.com" />
        </FormField>
        <FormField label="Kata Sandi">
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimal 8 karakter" />
        </FormField>
        <button className="btn w-full">Daftar</button>
        <p className="text-center text-xs text-gray-500 mt-2">Sudah punya akun? <a className="link" href="/login">Masuk</a></p>
      </form>
    </div>
  );
}
