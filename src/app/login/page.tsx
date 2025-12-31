'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';

function LoginForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const callbackUrl = searchParams.get('callbackUrl') || '/my-account'; // Default fallbacks

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
            // Sign in with credentials
            // redirect: false allows us to check the error property before page reload
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
                // Successfully logged in
                // We can't easily know the role here without an API call, 
                // but the middleware will handle the redirection logic if we send them to the right place.
                // However, let's try to just go to the callbackUrl or defaulting logic.
                // A simple page refresh or router.push should trigger middleware / session check.

                // FORCE reload to ensure cookies are sent and session is picked up
                // If we know they are admin (we don't client-side easily yet), we'd go to /admin

                // Let's try router.refresh() then router.push
                router.refresh();

                // Small delay to let cookie set
                setTimeout(() => {
                    // Check if callbackUrl is admin
                    if (callbackUrl.includes('/admin')) {
                        window.location.href = callbackUrl;
                    } else {
                        // For safety, fetch session to know where to go? 
                        // Or just go to /my-account or home.
                        window.location.href = callbackUrl;
                    }
                }, 500);
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
                        <div className="heading4 text-center">Login</div>
                        <p className="text-secondary text-center mt-2">Welcome back! Sign in to your account.</p>

                        <form className="mt-8" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-center font-semibold">
                                    {error}
                                </div>
                            )}

                            <div className="email mb-5">
                                <input
                                    className="border border-line px-5 py-3 w-full rounded-xl focus:border-black outline-none"
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
                                    className="border border-line px-5 py-3 w-full rounded-xl focus:border-black outline-none"
                                    type="password"
                                    placeholder="Password *"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    disabled={loading}
                                />
                            </div>

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

                            <button
                                className="button-main w-full bg-black text-white py-4 rounded-xl hover:bg-purple-700 duration-300 font-bold uppercase disabled:bg-purple-400 disabled:cursor-not-allowed"
                                disabled={loading}
                                type="submit"
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>

                            <div className="mt-4">
                                <Link
                                    href="/login?callbackUrl=/admin"
                                    className="block w-full text-center border border-black py-4 rounded-xl hover:bg-zinc-50 duration-300 font-bold uppercase transition-colors"
                                >
                                    Admin Login
                                </Link>
                            </div>
                        </form>

                        <div className="text-secondary text-center mt-6">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-black font-bold pl-1 hover:underline">
                                Register
                            </Link>
                        </div>
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
