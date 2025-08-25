'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';

interface Request {
    id: string;
    course: string;
    purpose: string;
    type: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface UserDetail {
    id: string;
    name: string;
    email: string;
    nim: string;
    role: string;
    dob: string;
    createdAt: string;
    requests: Request[];
    _count: {
        requests: number;
    };
}

export default function UserDetail({ params }: { params: { id: string } }) {
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);
    const router = useRouter();
    const { user: currentUser, loading: authLoading } = useAuth();

    useEffect(() => {
        // Wait for authentication to be checked
        if (authLoading) {
            return;
        }

        // Check if user is authenticated and is admin
        if (!currentUser) {
            router.push('/login');
            return;
        }

        if (currentUser.role !== 'ADMIN') {
            router.push('/login');
            return;
        }

        // Load user data
        setDataLoading(true);
        api(`/users/${params.id}`)
            .then(data => {
                if (data?.user) {
                    setUser(data.user);
                }
            })
            .catch((error) => {
                console.error('Error loading user:', error);
                router.push('/admin/users');
            })
            .finally(() => {
                setDataLoading(false);
                setLoading(false);
            });
    }, [currentUser, authLoading, router, params.id]);

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
                    <p className="text-gray-600 mt-4">Memuat detail pengguna...</p>
                </div>
            </div>
        );
    }

    // Don't render anything if not authenticated or not admin
    if (!currentUser || currentUser.role !== 'ADMIN') {
        return null;
    }

    if (!user) {
        return (
            <div className="container-narrow py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Pengguna tidak ditemukan</h1>
                    <Link href="/admin/users" className="btn-secondary">
                        Kembali ke Daftar Pengguna
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container-narrow py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Detail Pengguna</h1>
                            <p className="text-gray-600">Informasi lengkap pengguna dan riwayat permohonan</p>
                        </div>
                        <Link href="/admin/users" className="btn-secondary">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Kembali ke Daftar
                        </Link>
                    </div>
                </div>

                {/* User Information */}
                <div className="card mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Informasi Pengguna</h2>

                    {dataLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-2">Memuat data pengguna...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold text-blue-600">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
                                    <p className="text-gray-600">{user.email}</p>
                                    {getRoleBadge(user.role)}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-600">NIM:</span>
                                    <span className="text-sm text-gray-900">{user.nim}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-600">Tanggal Lahir:</span>
                                    <span className="text-sm text-gray-900">
                                        {new Date(user.dob).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-600">Bergabung Sejak:</span>
                                    <span className="text-sm text-gray-900">
                                        {new Date(user.createdAt).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-600">Total Permohonan:</span>
                                    <span className="text-sm font-semibold text-gray-900">{user._count.requests}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Requests */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Riwayat Permohonan</h2>
                        <div className="text-sm text-gray-500">
                            {user.requests.length} permohonan
                        </div>
                    </div>

                    {user.requests.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada permohonan</h3>
                            <p className="text-gray-500">Pengguna ini belum mengajukan permohonan transkrip</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>ID Aplikasi</th>
                                        <th>Jenis Transkrip</th>
                                        <th>Mata Kuliah</th>
                                        <th>Tujuan</th>
                                        <th>Status</th>
                                        <th>Tanggal Pengajuan</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {user.requests.map(request => (
                                        <tr key={request.id} className="hover:bg-gray-50">
                                            <td className="font-mono text-sm">{request.id.slice(-8)}</td>
                                            <td className="text-sm text-gray-900">{request.type}</td>
                                            <td className="text-sm text-gray-900">{request.course}</td>
                                            <td className="text-sm text-gray-600">{request.purpose}</td>
                                            <td>{getStatusBadge(request.status)}</td>
                                            <td className="text-sm text-gray-600">
                                                {new Date(request.createdAt).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/admin/requests/${request.id}`}
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
