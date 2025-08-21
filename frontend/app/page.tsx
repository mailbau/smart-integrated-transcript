'use client';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import Image from 'next/image';

export default function HomePage() {
  const { user, loading } = useAuth();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container-narrow py-16 relative z-10 min-h-screen flex flex-col">
        <div className="max-w-6xl mx-auto flex-1 flex flex-col">
          {/* Hero Section - Layout matching the image */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 flex-1">
            {/* Left side - Logo and icons */}
            <div className="flex-1 flex flex-col items-center lg:items-start">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <Image
                  src="/assets/sit_logo.png"
                  alt="SIT Logo"
                  width={800}
                  height={300}
                  className="w-auto h-64 lg:h-96 relative z-10 drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Right side - Title, slogan, and features */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4 drop-shadow-sm">
                SMART INTEGRATED TRANSCRIPT
              </h1>
              <p className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent mb-8 drop-shadow-sm">
                Verifikasi jadi easy!
              </p>

              {/* Feature boxes */}
              <div className="space-y-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    STATUS REAL-TIME
                  </h3>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    AMAN DAN TERPERCAYA
                  </h3>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    CEPAT DAN MUDAN
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons section - matching the image design */}
          <div className="mt-20 text-center flex-1 flex flex-col justify-end pb-8">
            <div className="max-w-4xl mx-auto">
              {/* Top rectangle - Alur dan Ketentuan */}
              <div className="mb-8">
                <a
                  href="https://drive.google.com/drive/u/1/folders/1PpngVFIruKCcWfU948kLzHndiYAVAx1G"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block bg-white/95 backdrop-blur-sm rounded-xl px-10 py-6 shadow-2xl border border-white/30 hover:shadow-3xl hover:scale-105 transition-all duration-300 group"
                >
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-300">
                    ALUR DAN KETENTUAN
                  </h3>
                </a>
              </div>

              {/* Bottom two rectangles side by side */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl px-10 py-6 shadow-2xl border border-white/30 hover:shadow-3xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-300">
                    AJUKAN TRANSKRIP
                  </h3>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-xl px-10 py-6 shadow-2xl border border-white/30 hover:shadow-3xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-300">
                    STATUS APLIKASI
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
