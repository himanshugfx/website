'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/my-account';

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
            console.log('Attempting login with callbackUrl:', callbackUrl);

            const res = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            console.log('Sign in response:', res);

            if (res?.error) {
                console.error('Login error:', res.error);
                setError('Invalid email or password');
                setLoading(false);
            } else if (res?.ok) {
                console.log('Login successful, redirecting to:', callbackUrl);
                // Force a full page reload to ensure session is loaded
                window.location.href = callbackUrl;
            } else {
                console.error('Unexpected response:', res);
                setError('Something went wrong');
                setLoading(false);
            }
        } catch (err) {
            console.error('Login exception:', err);
            setError('Something went wrong');
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
                            {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-center font-semibold">{error}</div>}

                            <div className="email mb-5">
                                <input
                                    className="border border-line px-5 py-3 w-full rounded-xl focus:border-black outline-none"
                                    type="email"
                                    placeholder="Email Address *"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                                />
                            </div>

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="remember" className="cursor-pointer" />
                                    <label htmlFor="remember" className="cursor-pointer text-sm">Remember me</label>
                                </div>
                                <Link href="/forgot-password" className="font-semibold hover:underline text-sm">Forgot password?</Link>
                            </div>

                            <button
                                className="button-main w-full bg-black text-white py-4 rounded-xl hover:bg-purple-700 duration-300 font-bold uppercase disabled:bg-purple-400"
                                disabled={loading}
                                type="submit"
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        <div className="text-secondary text-center mt-6">
                            Don't have an account?
                            <Link href="/register" className="text-black font-bold pl-1 hover:underline">Register</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="login-block md:py-20 py-10">
                <div className="container mx-auto">
                    <div className="content-main flex flex-col items-center">
                        <div className="md:w-1/2 w-full max-w-[500px]">
                            <div className="heading4 text-center">Loading...</div>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
