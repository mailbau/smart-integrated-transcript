'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';

interface User {
    id: string;
    name: string;
    email: string;
    nim: string;
    role: string;
    createdAt: string;
    _count: {
        requests: number;
    };
}

interface UserStats {
    totalUsers: number;
    totalRequests: number;
    pendingRequests: number;
    completedRequests: number;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<UserStats>({
        totalUsers: 0,
        totalRequests: 0,
        pendingRequests: 0,
        completedRequests: 0
    });
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);
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

        // Load users data
        setDataLoading(true);
        Promise.all([
            api('/users'),
            api('/users/stats')
        ])
            .then(([usersData, statsData]) => {
                if (usersData?.users) {
                    setUsers(usersData.users);
                }
                if (statsData?.stats) {
                    setStats(statsData.stats);
                }
            })
            .catch((error) => {
                console.error('Error loading users:', error);
            })
            .finally(() => {
                setDataLoading(false);
                setLoading(false);
            });
    }, [user, authLoading, router]);

    const getRoleBadge = (role: string) => {
        if (role === 'ADMIN') {
            return (
                <span className="badge border-red-300 bg-red-50 text-red-700">
                    Admin
                </span>
            );
        }
        return (
            <span className="badge border-gray-300 bg-gray-50 text-gray-700">
                User
            </span>
        );
    };

    // Show loading while auth is being checked
    if (authLoading || loading) {
        return (
            <div className="container-narrow py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Memuat data pengguna...</p>
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">Kelola Pengguna</h1>
                            <p className="text-blue-700">Kelola dan pantau data pengguna sistem</p>
                        </div>
                        <Link href="/admin" className="btn-secondary">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Kembali ke Dashboard
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-blue-900 mb-1">{stats.totalUsers}</h3>
                        <p className="text-sm text-blue-700">Total Pengguna</p>
                    </div>

                    <div className="card text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-purple-800 mb-1">{stats.totalRequests}</h3>
                        <p className="text-sm text-purple-700">Total Permohonan</p>
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
                </div>

                {/* Users Table */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-blue-900">Daftar Pengguna</h2>
                        <div className="text-sm text-blue-600">
                            Menampilkan {users.length} pengguna
                        </div>
                    </div>

                    {dataLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-2">Memuat data pengguna...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada pengguna</h3>
                            <p className="text-gray-500">Belum ada pengguna yang terdaftar dalam sistem</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Nama</th>
                                        <th>Email</th>
                                        <th>NIM</th>
                                        <th>Role</th>
                                        <th>Jumlah Permohonan</th>
                                        <th>Tanggal Bergabung</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td>
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                        <span className="text-sm font-medium text-blue-600">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="font-medium text-gray-900">{user.name}</div>
                                                </div>
                                            </td>
                                            <td className="text-sm text-gray-600">{user.email}</td>
                                            <td className="text-sm text-gray-900">{user.nim}</td>
                                            <td>{getRoleBadge(user.role)}</td>
                                            <td className="text-sm text-gray-900">
                                                <span className="font-medium">{user._count.requests}</span> permohonan
                                            </td>
                                            <td className="text-sm text-gray-600">
                                                {new Date(user.createdAt).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/admin/users/${user.id}`}
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
