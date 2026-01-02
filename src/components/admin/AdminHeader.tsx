'use client';

import { useSession, signOut } from 'next-auth/react';
import { Menu, LogOut, Bell, Settings } from 'lucide-react';
import { useState } from 'react';

interface AdminHeaderProps {
    onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const { data: session } = useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
            <div className="flex items-center justify-between h-16 lg:h-20 px-4 sm:px-6 lg:px-8">
                {/* Mobile menu button - larger touch target */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden text-gray-700 p-3 -ml-2 rounded-xl transition-colors active:bg-gray-100"
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Mobile title */}
                <div className="lg:hidden flex-1 text-center">
                    <h2 className="text-base font-bold text-gray-900">Anose Admin</h2>
                </div>

                {/* Page title for desktop */}
                <div className="hidden lg:block">
                    <h2 className="text-xl font-bold text-gray-900">Welcome back, {session?.user?.name?.split(' ')[0] || 'Admin'}! 👋</h2>
                    <p className="text-sm text-gray-500 mt-1">Here&apos;s what&apos;s happening with your store today.</p>
                </div>

                <div className="hidden lg:flex-1 lg:flex-none"></div>


                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

                    {/* User menu */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-3 px-2 py-1.5 rounded-xl border border-transparent"
                        >
                            <div className="hidden sm:block text-left">
                                <p className="font-semibold text-gray-900 text-sm leading-none">{session?.user?.name || 'Admin'}</p>
                                <p className="text-xs text-gray-500 mt-1 font-medium">Administrator</p>
                            </div>
                        </button>

                        {/* Dropdown menu */}
                        {dropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setDropdownOpen(false)}
                                />
                                <div className="absolute right-0 z-20 mt-3 w-64 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 py-2 overflow-hidden transform origin-top-right transition-all">
                                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {session?.user?.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{session?.user?.email}</p>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={() => signOut({ callbackUrl: '/' })}
                                            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl transition-colors gap-3 group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center transition-colors">
                                                <LogOut className="w-4 h-4" />
                                            </div>
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
