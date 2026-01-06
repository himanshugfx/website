'use client';

import { useSession, signOut } from 'next-auth/react';
import { Menu, LogOut, Bell, Settings, User } from 'lucide-react';
import { useState } from 'react';

interface AdminHeaderProps {
    onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const { data: session } = useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
            <div className="flex items-center justify-between h-16 lg:h-20 px-4 sm:px-8 lg:px-12 xl:px-16">
                <div className="flex items-center gap-4">
                    {/* Mobile menu button */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden text-gray-700 p-2.5 -ml-2 rounded-xl transition-colors active:bg-gray-100"
                        aria-label="Open menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Desktop Welcome Title */}
                    <div className="hidden lg:block">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">
                            Welcome back, {session?.user?.name?.split(' ')[0] || 'Admin'}! 👋
                        </h2>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">Managing Anose Admin Panel</p>
                    </div>

                    {/* Mobile title */}
                    <div className="lg:hidden">
                        <h2 className="text-base font-bold text-gray-900">Anose Admin</h2>
                    </div>
                </div>

                <div className="flex items-center gap-4 ml-auto">
                    {/* User menu / Profile Button - Pushed to the right */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-3 p-1 sm:p-2 rounded-2xl hover:bg-gray-50 transition-all border border-transparent group"
                        >
                            <div className="hidden sm:block text-right mr-1">
                                <p className="font-bold text-gray-900 text-sm leading-tight">{session?.user?.name || 'Admin User'}</p>
                                <p className="text-[10px] text-purple-600 font-black uppercase tracking-widest mt-0.5">Online</p>
                            </div>
                            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                                <span className="text-white font-bold text-lg">
                                    {(session?.user?.name || 'A').charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </button>

                        {/* Dropdown menu */}
                        {dropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setDropdownOpen(false)}
                                />
                                <div className="absolute right-0 z-20 mt-3 w-64 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 py-2 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                        <p className="text-sm font-bold text-gray-900">
                                            {session?.user?.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{session?.user?.email}</p>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        <button
                                            onClick={() => {
                                                window.location.href = '/admin/profile';
                                                setDropdownOpen(false);
                                            }}
                                            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors gap-3 group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-purple-100 text-gray-400 group-hover:text-purple-600 flex items-center justify-center transition-colors">
                                                <Settings className="w-4 h-4" />
                                            </div>
                                            Security Settings
                                        </button>
                                        <button
                                            onClick={() => signOut({ callbackUrl: '/' })}
                                            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors gap-3 group"
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
