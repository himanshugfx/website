'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/login');
            } else {
                const data = await res.text();
                setError(data || 'Something went wrong');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-block md:py-20 py-10">
            <div className="container mx-auto">
                <div className="content-main flex flex-col items-center">
                    <div className="md:w-1/2 w-full max-w-[500px]">
                        <div className="heading4 text-center">Register</div>
                        <p className="text-secondary text-center mt-2">Create an account to track orders and save preferences.</p>

                        <form className="mt-8" onSubmit={handleSubmit}>
                            {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-center font-semibold">{error}</div>}

                            <div className="name mb-5">
                                <input
                                    className="border border-line px-5 py-3 w-full rounded-xl focus:border-black outline-none"
                                    type="text"
                                    placeholder="Full Name *"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

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

                            <div className="confirm-password mb-8">
                                <input
                                    className="border border-line px-5 py-3 w-full rounded-xl focus:border-black outline-none"
                                    type="password"
                                    placeholder="Confirm Password *"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>

                            <button
                                className="button-main w-full bg-purple-600 text-white py-4 rounded-xl hover:bg-purple-700 duration-300 font-bold uppercase disabled:bg-zinc-400"
                                disabled={loading}
                            >
                                {loading ? 'Creating Account...' : 'Register'}
                            </button>
                        </form>

                        <div className="text-secondary text-center mt-6">
                            Already have an account?
                            <Link href="/login" className="text-black font-bold pl-1 hover:underline">Login</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
