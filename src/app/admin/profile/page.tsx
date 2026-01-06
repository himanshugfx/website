'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfileSettingsPage() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);

        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', message: 'New passwords do not match' });
            return;
        }

        if (newPassword.length < 8) {
            setStatus({ type: 'error', message: 'New password must be at least 8 characters long' });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/admin/profile/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: 'Password updated successfully!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setStatus({ type: 'error', message: data.error || 'Failed to update password' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'An unexpected error occurred' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
                    <p className="mt-2 text-gray-500">
                        Manage your account security and password
                    </p>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                                <Lock className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                                <p className="text-sm text-gray-500 text-zinc-400 font-medium">Update your administrative credentials</p>
                            </div>
                        </div>

                        {status && (
                            <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                }`}>
                                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                <p className="text-sm font-medium">{status.message}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showCurrent ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                        className="w-full pl-5 pr-12 py-4 rounded-2xl border border-gray-200 focus:border-purple-600 outline-none transition-all bg-zinc-50 focus:bg-white"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrent(!showCurrent)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                                    >
                                        {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <hr className="border-gray-100 my-2" />

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showNew ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="w-full pl-5 pr-12 py-4 rounded-2xl border border-gray-200 focus:border-purple-600 outline-none transition-all bg-zinc-50 focus:bg-white"
                                        placeholder="Min. 8 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                                    >
                                        {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-purple-600 outline-none transition-all bg-zinc-50 focus:bg-white"
                                    placeholder="Repeat new password"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-zinc-900 hover:bg-black text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg active:scale-98 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <span className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Update Password"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                    <div className="flex gap-4">
                        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-amber-900">Important Security Note</h4>
                            <p className="mt-1 text-sm text-amber-700 leading-relaxed">
                                Changing your password will not end your current session, but it will be required for all future logins across all devices.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
