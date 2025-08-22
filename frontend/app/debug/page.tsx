'use client';
import { useState, useEffect } from 'react';
import { api, debugJwt } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function DebugPage() {
    const [jwtConfig, setJwtConfig] = useState<any>(null);
    const [authTest, setAuthTest] = useState<any>(null);
    const [cookieInfo, setCookieInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        const runDebug = async () => {
            try {
                const [jwt, auth, cookies] = await Promise.all([
                    debugJwt(),
                    api('/auth/me').catch(e => ({ error: e.message })),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8080'}/debug/cookies`, {
                        credentials: 'include'
                    }).then(res => res.json()).catch(e => ({ error: e.message }))
                ]);
                setJwtConfig(jwt);
                setAuthTest(auth);
                setCookieInfo(cookies);
            } catch (error: any) {
                console.error('Debug error:', error);
            } finally {
                setLoading(false);
            }
        };

        runDebug();
    }, []);

    if (loading || authLoading) {
        return (
            <div className="container-narrow py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading debug info...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-narrow py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-8">Debug Information</h1>

                <div className="grid gap-6">
                    {/* JWT Configuration */}
                    <div className="card">
                        <h2 className="text-xl font-semibold mb-4">JWT Configuration</h2>
                        {jwtConfig ? (
                            <div className="space-y-2 text-sm">
                                <div><strong>JWT Secret:</strong> {jwtConfig.jwtSecret}</div>
                                <div><strong>Secret Length:</strong> {jwtConfig.jwtSecretLength}</div>
                                <div><strong>Using Default Secret:</strong> {jwtConfig.isDefaultSecret ? 'Yes ⚠️' : 'No ✅'}</div>
                                <div><strong>Node Environment:</strong> {jwtConfig.nodeEnv}</div>
                                <div><strong>Client Origin:</strong> {jwtConfig.clientOrigin}</div>
                            </div>
                        ) : (
                            <p className="text-red-600">Failed to load JWT config</p>
                        )}
                    </div>

                    {/* Authentication Status */}
                    <div className="card">
                        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
                        <div className="space-y-2 text-sm">
                            <div><strong>Auth Context User:</strong> {user ? `${user.name} (${user.role})` : 'Not logged in'}</div>
                            <div><strong>Auth Test Result:</strong> {authTest?.error ? `Error: ${authTest.error}` : 'Success'}</div>
                            <div><strong>Current Domain:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Unknown'}</div>
                            <div><strong>Cookies Enabled:</strong> {typeof navigator !== 'undefined' ? navigator.cookieEnabled ? 'Yes' : 'No' : 'Unknown'}</div>
                        </div>
                    </div>

                    {/* Cookie Information */}
                    <div className="card">
                        <h2 className="text-xl font-semibold mb-4">Cookie Information</h2>
                        <div className="space-y-2 text-sm">
                            <div><strong>Token Cookie:</strong> {cookieInfo?.cookies?.token ? 'Present' : 'Missing'}</div>
                            <div><strong>User Agent:</strong> {cookieInfo?.headers?.['user-agent']?.substring(0, 50)}...</div>
                            <div><strong>Origin:</strong> {cookieInfo?.headers?.origin || 'Not set'}</div>
                            <div><strong>Referer:</strong> {cookieInfo?.headers?.referer || 'Not set'}</div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="card">
                        <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
                        <div className="space-y-2 text-sm">
                            {jwtConfig?.isDefaultSecret && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <strong>⚠️ Set JWT_SECRET:</strong> Add a strong JWT_SECRET environment variable to your backend.
                                </div>
                            )}
                            {!user && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <strong>ℹ️ Not Authenticated:</strong> Try logging in to test the authentication flow.
                                </div>
                            )}
                            {authTest?.error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <strong>❌ Auth Error:</strong> {authTest.error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
