'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';

function LoginForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const callbackUrl = searchParams.get('callbackUrl') || '/my-account';
    const isAdminMode = searchParams.get('callbackUrl') === '/admin';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // First, try to sign in with redirect: false to catch errors
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
                setLoading(false);
                return;
            }

            if (result?.ok) {
                // FORCE a full page reload to the target callback
                // This is the most reliable way to ensure the session cookie is read by the middleware
                window.location.href = isAdminMode ? '/admin' : callbackUrl;
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="login-block md:py-20 py-10">
            <div className="container mx-auto">
                <div className="content-main flex flex-col items-center">
                    <div className="md:w-1/2 w-full max-w-[500px]">
                        <div className="heading4 text-center">
                            {isAdminMode ? 'Admin Login' : 'Login'}
                        </div>
                        <p className="text-secondary text-center mt-2">
                            {isAdminMode
                                ? 'Access the administration dashboard.'
                                : 'Welcome back! Sign in to your account.'}
                        </p>

                        <form className="mt-8" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-center font-semibold border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div className="email mb-5">
                                <input
                                    className="border border-line px-5 py-3 w-full rounded-xl focus:border-black outline-none transition-all"
                                    type="email"
                                    placeholder="Email Address *"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={loading}
                                />
                            </div>

                            <div className="password mb-5">
                                <input
                                    className="border border-line px-5 py-3 w-full rounded-xl focus:border-black outline-none transition-all"
                                    type="password"
                                    placeholder="Password *"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    disabled={loading}
                                />
                            </div>

                            {!isAdminMode && (
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="remember"
                                            className="cursor-pointer"
                                            disabled={loading}
                                        />
                                        <label htmlFor="remember" className="cursor-pointer text-sm">Remember me</label>
                                    </div>
                                    <Link href="/forgot-password" className="font-semibold hover:underline text-sm">
                                        Forgot password?
                                    </Link>
                                </div>
                            )}

                            <button
                                className={`button-main w-full py-4 rounded-xl font-bold uppercase disabled:cursor-not-allowed ${isAdminMode
                                    ? 'bg-black text-white shadow-lg'
                                    : 'bg-black text-white'
                                    }`}
                                disabled={loading}
                                type="submit"
                            >
                                {loading ? 'Logging in...' : (isAdminMode ? 'Login to Dashboard' : 'Login')}
                            </button>

                            {/* Divider */}
                            {!isAdminMode && (
                                <>
                                    <div className="flex items-center my-6">
                                        <div className="flex-1 border-t border-gray-300"></div>
                                        <span className="px-4 text-sm text-gray-500">or continue with</span>
                                        <div className="flex-1 border-t border-gray-300"></div>
                                    </div>

                                    {/* Google Sign-In Button */}
                                    <button
                                        type="button"
                                        onClick={() => signIn('google', { callbackUrl })}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Continue with Google
                                    </button>
                                </>
                            )}

                            <div className="mt-6 flex flex-col gap-4">
                                {isAdminMode ? (
                                    <Link
                                        href="/login"
                                        className="text-center text-sm font-semibold hover:underline"
                                    >
                                        Back to User Login
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login?callbackUrl=/admin"
                                        className="block w-full text-center bg-black border border-black py-3 rounded-xl text-white font-bold uppercase text-sm transition-colors"
                                    >
                                        Admin Login
                                    </Link>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="login-block md:py-20 py-10">
                    <div className="container mx-auto">
                        <div className="content-main flex flex-col items-center">
                            <div className="md:w-1/2 w-full max-w-[500px]">
                                <div className="heading4 text-center">Loading...</div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}
