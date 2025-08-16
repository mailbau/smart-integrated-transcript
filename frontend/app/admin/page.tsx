'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [list, setList] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and is admin
    api('/auth/me')
      .then(response => {
        if (response.user.role !== 'ADMIN') {
          router.push('/login');
          return;
        }
        setUser(response.user);
        // Load requests data
        return api('/requests');
      })
      .then(data => {
        if (data?.requests) {
          setList(data.requests);
        }
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return <div className="py-6">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const stat = (label: string, value: string | number) => (
    <div className="card">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );

  return (
    <div className="py-6">
      <h1 className="text-xl font-semibold mb-4">Dasbor Admin</h1>
      <div className="grid grid-cols-3 gap-4">
        {stat('Permohonan Saat Ini', list.length)}
        {stat('Pengguna Terdaftar', '—')}
        {stat('Transkrip Terverifikasi', list.filter(r => r.status === 'COMPLETED').length)}
      </div>
      <div className="card mt-6">
        <div className="font-medium mb-2">Permohonan Terbaru</div>
        <table className="table">
          <thead><tr><th>ID Aplikasi</th><th>Nama Pengguna</th><th>Tanggal</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {list.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.user?.name}</td>
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td><span className="badge border-gray-300">{r.status}</span></td>
                <td><Link className="link" href={`/admin/requests/${r.id}`}>Detail</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
