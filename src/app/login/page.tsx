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
                                className={`button-main w-full py-4 rounded-xl duration-300 font-bold uppercase disabled:cursor-not-allowed ${isAdminMode
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200'
                                    : 'bg-black hover:bg-zinc-800 text-white'
                                    }`}
                                disabled={loading}
                                type="submit"
                            >
                                {loading ? 'Logging in...' : (isAdminMode ? 'Login to Dashboard' : 'Login')}
                            </button>

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
                                        className="block w-full text-center border border-zinc-200 py-3 rounded-xl hover:bg-zinc-50 duration-300 font-bold uppercase text-sm transition-colors"
                                    >
                                        Admin Login
                                    </Link>
                                )}
                            </div>
                        </form>

                        {!isAdminMode && (
                            <div className="text-secondary text-center mt-8">
                                Don't have an account?{' '}
                                <Link href="/register" className="text-black font-bold pl-1 hover:underline">
                                    Register
                                </Link>
                            </div>
                        )}
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
