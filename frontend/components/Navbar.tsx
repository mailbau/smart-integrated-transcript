'use client';
import { useState } from 'react';
import { api } from '../lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
    const { user, loading, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await api('/auth/logout', { method: 'POST' });
            logout();
            setMobileMenuOpen(false);
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center">
                            <div className="text-2xl font-bold text-blue-600">SIT</div>
                        </div>
                        {user && (
                            <div className="hidden md:flex items-center space-x-6">
                                {user.role === 'ADMIN' ? (
                                    <>
                                        <a href="/admin" className="nav-link">Dashboard Admin</a>
                                        <a href="/admin/users" className="nav-link">Kelola Pengguna</a>
                                    </>
                                ) : (
                                    <>
                                        <a href="/request" className="nav-link">Ajukan Transkrip</a>
                                        <a href="/status" className="nav-link">Status Aplikasi</a>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {loading ? (
                            <div className="animate-pulse">
                                <div className="h-8 w-20 bg-gray-200 rounded"></div>
                            </div>
                        ) : user ? (
                            <div className="flex items-center space-x-4">
                                <div className="text-sm text-gray-600">
                                    Halo, {user.name}
                                </div>
                                <div className="relative group">
                                    <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors duration-200">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-blue-600">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        <div className="py-1">
                                            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-gray-500">{user.email}</div>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                            >
                                                Keluar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <a href="/login" className="nav-link">Masuk</a>
                                <a href="/register" className="btn">Daftar</a>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        {loading ? (
                            <div className="animate-pulse">
                                <div className="h-6 w-6 bg-gray-200 rounded"></div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {user ? (
                                <>
                                    <div className="px-3 py-2 text-sm text-gray-700 border-b border-gray-100 mb-2">
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-gray-500">{user.email}</div>
                                    </div>
                                    {user.role === 'ADMIN' ? (
                                        <>
                                            <a
                                                href="/admin"
                                                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Dashboard Admin
                                            </a>
                                            <a
                                                href="/admin/users"
                                                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Kelola Pengguna
                                            </a>
                                        </>
                                    ) : (
                                        <>
                                            <a
                                                href="/request"
                                                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Ajukan Transkrip
                                            </a>
                                            <a
                                                href="/status"
                                                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Status Aplikasi
                                            </a>
                                        </>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                                    >
                                        Keluar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <a
                                        href="/login"
                                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Masuk
                                    </a>
                                    <a
                                        href="/register"
                                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Daftar
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
