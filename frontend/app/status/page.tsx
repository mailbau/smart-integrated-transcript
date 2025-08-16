'use client';
import { useEffect, useState } from 'react';
import { api, downloadFile } from '../../lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StatusPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        setLoading(true);
        setError(null);

        // First check if user is authenticated
        api('/auth/me')
            .then(() => {
                // If authenticated, try to get user's requests
                return api('/requests/my');
            })
            .then(data => {
                if (data?.requests) {
                    setRequests(data.requests);
                } else {
                    setRequests([]);
                }
            })
            .catch((err) => {
                console.error('Error loading requests:', err);
                if (err.message?.includes('Unauthorized') || err.message?.includes('Unauthenticated')) {
                    setError('Silakan login terlebih dahulu untuk melihat status permohonan');
                } else {
                    setError('Gagal memuat data permohonan. Silakan coba lagi.');
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: { label: string; className: string } } = {
            'SUBMITTED': { label: 'Diajukan', className: 'border-blue-300 bg-blue-50 text-blue-700' },
            'UNDER_REVIEW': { label: 'Sedang Diproses', className: 'border-yellow-300 bg-yellow-50 text-yellow-700' },
            'APPROVED': { label: 'Disetujui', className: 'border-green-300 bg-green-50 text-green-700' },
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
                    {error.includes('login') && (
                        <button
                            className="btn mt-4"
                            onClick={() => router.push('/login')}
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="container-narrow py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Status Aplikasi Transkrip</h1>
                <p className="text-gray-600">Lihat status permohonan transkrip Anda</p>
            </div>

            {requests.length === 0 ? (
                <div className="card text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada permohonan</h3>
                    <p className="text-gray-500 mb-6">Anda belum mengajukan permohonan transkrip</p>
                    <Link href="/request" className="btn">
                        Ajukan Transkrip Pertama
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {requests.map((request) => (
                        <div key={request.id} className="card hover:shadow-lg transition-shadow duration-200">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Permohonan #{request.id.slice(-8)}
                                        </h3>
                                        {getStatusBadge(request.status)}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {new Date(request.createdAt).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Jenis:</span>
                                        <span className="text-sm font-medium text-gray-900">{request.type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Mata Kuliah:</span>
                                        <span className="text-sm font-medium text-gray-900">{request.course}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Keperluan:</span>
                                        <span className="text-sm font-medium text-gray-900">{request.purpose}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href={`/status/${request.id}`}
                                    className="btn-secondary"
                                >
                                    Lihat Detail
                                </Link>
                                {request.transcriptUrl && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await downloadFile(request.id, request.transcriptUrl);
                                            } catch (error) {
                                                console.error('Download failed:', error);
                                                alert('Gagal mengunduh transkrip. Silakan coba lagi.');
                                            }
                                        }}
                                        className="btn-success"
                                    >
                                        Unduh Transkrip
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
