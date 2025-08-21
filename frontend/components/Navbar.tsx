'use client';
import { useState } from 'react';
import { api } from '../lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Image from 'next/image';

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
        <nav className="bg-gradient-to-r from-blue-50/95 via-indigo-50/95 to-blue-100/95 backdrop-blur-md border-b border-blue-200/30 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center">
                            <Image
                                src="/assets/sit_logo.png"
                                alt="SIT Logo"
                                width={120}
                                height={40}
                                className="h-10 w-auto"
                            />
                        </div>
                        {user && (
                            <div className="hidden md:flex items-center space-x-6">
                                {user.role === 'ADMIN' ? (
                                    <>
                                        <a href="/admin" className="nav-link hover:text-blue-700 hover:bg-blue-100/50 px-3 py-2 rounded-lg transition-all duration-300">Dashboard Admin</a>
                                        <a href="/admin/users" className="nav-link hover:text-blue-700 hover:bg-blue-100/50 px-3 py-2 rounded-lg transition-all duration-300">Kelola Pengguna</a>
                                    </>
                                ) : (
                                    <>
                                        <a href="/request" className="nav-link hover:text-blue-700 hover:bg-blue-100/50 px-3 py-2 rounded-lg transition-all duration-300">Ajukan Transkrip</a>
                                        <a href="/status" className="nav-link hover:text-blue-700 hover:bg-blue-100/50 px-3 py-2 rounded-lg transition-all duration-300">Status Aplikasi</a>
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
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                                            <span className="text-sm font-medium text-white">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-blue-200/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                        <div className="py-1">
                                            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-gray-500">{user.email}</div>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 rounded-lg mx-2"
                                            >
                                                Keluar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <a href="/login" className="nav-link hover:text-blue-700 hover:bg-blue-100/50 px-3 py-2 rounded-lg transition-all duration-300">Masuk</a>
                                <a href="/register" className="btn hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl transition-all duration-300">Daftar</a>
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
                    <div className="md:hidden border-t border-blue-200/30">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {user ? (
                                <>
                                    <div className="px-3 py-2 text-sm text-gray-700 border-b border-blue-100 mb-2">
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-gray-500">{user.email}</div>
                                    </div>
                                    {user.role === 'ADMIN' ? (
                                        <>
                                            <a
                                                href="/admin"
                                                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-300"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Dashboard Admin
                                            </a>
                                            <a
                                                href="/admin/users"
                                                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-300"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Kelola Pengguna
                                            </a>
                                        </>
                                    ) : (
                                        <>
                                            <a
                                                href="/request"
                                                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-300"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Ajukan Transkrip
                                            </a>
                                            <a
                                                href="/status"
                                                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-300"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Status Aplikasi
                                            </a>
                                        </>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-300"
                                    >
                                        Keluar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <a
                                        href="/login"
                                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-300"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Masuk
                                    </a>
                                    <a
                                        href="/register"
                                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-300"
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
