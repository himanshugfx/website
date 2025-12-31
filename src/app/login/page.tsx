'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/my-account';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'customer' as 'customer' | 'admin',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Sign in with credentials
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

            if (!result?.ok) {
                setError('Something went wrong. Please try again.');
                setLoading(false);
                return;
            }

            // Login successful - wait a moment for cookies to be set, then check user role and redirect
            // Small delay to ensure NextAuth cookies are properly set
            await new Promise(resolve => setTimeout(resolve, 500));
            await checkUserRoleAndRedirect();
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    const checkUserRoleAndRedirect = async () => {
        const maxRetries = 20;
        let retries = 0;

        while (retries < maxRetries) {
            try {
                // Fetch session with cache busting
                const response = await fetch(`/api/auth/session?_=${Date.now()}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                    },
                });

                if (response.ok) {
                    const session = await response.json();
                    
                    if (session?.user) {
                        const userRole = (session.user as any).role;
                        
                        if (userRole === 'admin') {
                            // Admin user - always redirect to admin dashboard
                            // Use replace instead of href to avoid back button issues
                            // Add a small delay to ensure cookies are fully set
                            await new Promise(resolve => setTimeout(resolve, 100));
                            window.location.replace('/admin');
                            return;
                        } else {
                            // Regular customer - redirect based on callbackUrl
                            const redirectPath = callbackUrl.startsWith('/admin') 
                                ? '/my-account' 
                                : callbackUrl;
                            await new Promise(resolve => setTimeout(resolve, 100));
                            window.location.replace(redirectPath);
                            return;
                        }
                    }
                }

                // Session not ready yet, wait a bit and retry
                retries++;
                if (retries < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            } catch (fetchError) {
                console.error('Error fetching session:', fetchError);
                retries++;
                if (retries < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }
        }

        // If we've exhausted retries, use fallback redirect
        console.warn('Session check failed after retries, using fallback redirect');
        const fallbackPath = callbackUrl.startsWith('/admin') ? '/my-account' : callbackUrl;
        window.location.replace(fallbackPath);
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

                            <div className="role mb-5">
                                <select
                                    className="border border-line px-5 py-3 w-full rounded-xl focus:border-black outline-none bg-white"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'customer' | 'admin' })}
                                    required
                                    disabled={loading}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="admin">Admin</option>
                                </select>
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
