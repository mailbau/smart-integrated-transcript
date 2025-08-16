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
                // Note: We'll need to create an endpoint for this
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
            <div className="py-6">
                <h1 className="text-xl font-semibold mb-4">Status Aplikasi Transkrip</h1>
                <p className="text-sm text-gray-500">Memuat...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-6">
                <h1 className="text-xl font-semibold mb-4">Status Aplikasi Transkrip</h1>
                <div className="card">
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
        <div className="py-6">
            <h1 className="text-xl font-semibold mb-4">Status Aplikasi Transkrip</h1>

            {requests.length === 0 ? (
                <div className="card text-center">
                    <p className="text-gray-500 mb-4">Belum ada permohonan transkrip</p>
                    <Link href="/request" className="btn">
                        Ajukan Transkrip Pertama
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div key={request.id} className="card">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="font-medium">Permohonan #{request.id.slice(-8)}</h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(request.createdAt).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                {getStatusBadge(request.status)}
                            </div>

                            <div className="text-sm text-gray-600 mb-3">
                                <div>Jenis: {request.type}</div>
                                <div>Mata Kuliah: {request.course}</div>
                                <div>Keperluan: {request.purpose}</div>
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    href={`/status/${request.id}`}
                                    className="btn text-sm"
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
                                        className="btn text-sm bg-green-600 hover:bg-green-700"
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
