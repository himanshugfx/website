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
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
            <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden text-gray-500 hover:text-purple-600 p-2 hover:bg-purple-50 rounded-xl transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Page title for desktop */}
                <div className="hidden lg:block">
                    <h2 className="text-xl font-bold text-gray-900">Welcome back, {session?.user?.name?.split(' ')[0] || 'Admin'}! 👋</h2>
                    <p className="text-sm text-gray-500 mt-1">Here's what's happening with your store today.</p>
                </div>

                <div className="flex-1 lg:flex-none"></div>

                {/* Right section */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Notifications */}
                    <button className="p-2.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 relative group">
                        <Bell className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    {/* Settings */}
                    <button className="p-2.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 group">
                        <Settings className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-500" />
                    </button>

                    <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

                    {/* User menu */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-100"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 text-white font-semibold text-lg ring-2 ring-white">
                                {session?.user?.name?.charAt(0) || 'A'}
                            </div>
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
                                            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors gap-3 group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
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
