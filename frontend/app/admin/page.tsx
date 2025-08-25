'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboard() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    totalUsers: 0
  });
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for authentication to be checked
    if (authLoading) {
      return;
    }

    // Check if user is authenticated and is admin
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    // Load requests data
    setDataLoading(true);
    api('/requests')
      .then(data => {
        if (data?.requests) {
          setList(data.requests);

          // Calculate stats
          const totalRequests = data.requests.length;
          const pendingRequests = data.requests.filter((r: any) => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length;
          const completedRequests = data.requests.filter((r: any) => r.status === 'COMPLETED').length;

          setStats({
            totalRequests,
            pendingRequests,
            completedRequests,
            totalUsers: data.requests.length // This should come from a separate API call
          });
        }
      })
      .catch((error) => {
        console.error('Error loading requests:', error);
        // Don't redirect on data loading error, just show empty state
      })
      .finally(() => {
        setDataLoading(false);
        setLoading(false);
      });
  }, [user, authLoading, router]);

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      'SUBMITTED': { label: 'Diajukan', className: 'border-blue-300 bg-blue-50 text-blue-700' },
      'UNDER_REVIEW': { label: 'Sedang Diproses', className: 'border-yellow-300 bg-yellow-50 text-yellow-700' },
      'APPROVED': { label: 'Verifikasi Diajukan', className: 'border-green-300 bg-green-50 text-green-700' },
      'REJECTED': { label: 'Ditolak', className: 'border-red-300 bg-red-50 text-red-700' },
      'COMPLETED': { label: 'Selesai', className: 'border-green-300 bg-green-50 text-green-700' }
    };

    const statusInfo = statusMap[status] || { label: status, className: 'border-gray-300 bg-gray-50 text-gray-700' };
    return (
      <span className={`badge ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  // Show loading while auth is being checked
  if (authLoading || loading) {
    return (
      <div className="container-narrow py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated or not admin
  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="container-narrow py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">Dashboard Admin</h1>
          <p className="text-blue-700">Kelola permohonan transkrip dan pantau statistik sistem</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-blue-900 mb-1">{stats.totalRequests}</h3>
            <p className="text-sm text-blue-700">Total Permohonan</p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-yellow-800 mb-1">{stats.pendingRequests}</h3>
            <p className="text-sm text-yellow-700">Menunggu Proses</p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-1">{stats.completedRequests}</h3>
            <p className="text-sm text-green-700">Selesai Diproses</p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-purple-800 mb-1">{stats.totalUsers}</h3>
            <p className="text-sm text-purple-700">Total Pengguna</p>
          </div>
        </div>

        {/* Recent Requests Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-blue-900">Permohonan Terbaru</h2>
            <div className="text-sm text-blue-600">
              Menampilkan {list.length} permohonan terbaru
            </div>
          </div>

          {dataLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Memuat data permohonan...</p>
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada permohonan</h3>
              <p className="text-gray-500">Belum ada permohonan transkrip yang diajukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>ID Aplikasi</th>
                    <th>Nama Pengguna</th>
                    <th>Jenis Transkrip</th>
                    <th>Tanggal Pengajuan</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {list.slice(0, 10).map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="font-mono text-sm">{r.id.slice(-8)}</td>
                      <td>
                        <div>
                          <div className="font-medium text-gray-900">{r.user?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{r.user?.email || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="text-sm text-gray-900">{r.type}</td>
                      <td className="text-sm text-gray-600">
                        {new Date(r.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td>{getStatusBadge(r.status)}</td>
                      <td>
                        <Link
                          href={`/admin/requests/${r.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          Lihat Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
