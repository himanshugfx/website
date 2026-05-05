'use client';

import { useSession, signOut } from 'next-auth/react';
import { Menu, LogOut, Bell, Settings, User, Search, ChevronDown, Shield } from 'lucide-react';
import { useState } from 'react';

interface AdminHeaderProps {
    onMenuClick: () => void;
    activeTopTab: 'Dashboard' | 'Store' | 'Sales' | 'Marketing' | 'Finance';
    onTabChange: (tab: 'Dashboard' | 'Store' | 'Sales' | 'Marketing' | 'Finance') => void;
}

export default function AdminHeader({ onMenuClick, activeTopTab, onTabChange }: AdminHeaderProps) {
    const { data: session } = useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const navPills: ('Dashboard' | 'Store' | 'Sales' | 'Marketing' | 'Finance')[] = ['Dashboard', 'Store', 'Sales', 'Marketing', 'Finance'];

    return (
        <header className="sticky top-0 z-40 py-4 md:py-8 bg-[#f4f7fe]/80 backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 relative">
                
                {/* Top Row for Mobile (Hamburger + Profile) */}
                <div className="flex items-center justify-between w-full md:w-auto">
                    {/* Left Section: Mobile Menu Only */}
                    <div className="flex items-center">
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden text-gray-700 p-2.5 rounded-xl transition-colors active:bg-gray-100 bg-white shadow-sm border border-gray-100"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        {/* Placeholder for left space balance */}
                        <div className="hidden lg:block w-10"></div>
                    </div>

                    {/* Mobile Profile (Hidden on Desktop) */}
                    <div className="md:hidden relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 text-white font-black text-sm">
                                {(session?.user?.name || 'A').charAt(0).toUpperCase()}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {dropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                                <div className="absolute right-0 z-20 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 transform origin-top-right transition-all">
                                    <button 
                                        onClick={() => {
                                            window.location.href = '/admin/profile';
                                            setDropdownOpen(false);
                                        }}
                                        className="flex items-center w-full px-3 py-2 text-sm font-bold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors gap-3"
                                    >
                                        <User className="w-4 h-4" /> Settings
                                    </button>
                                    <button 
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                        className="flex items-center w-full px-3 py-2 text-sm font-bold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors gap-3"
                                    >
                                        <LogOut className="w-4 h-4" /> Sign out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Center Section: Navigation Pills */}
                <div className="flex md:absolute md:left-1/2 md:-translate-x-1/2 items-center bg-white p-1 rounded-2xl md:rounded-[1.5rem] border border-gray-100 shadow-sm overflow-x-auto no-scrollbar w-full md:w-auto">
                    {navPills.map((pill) => (
                        <button
                            key={pill}
                            type="button"
                            onClick={() => onTabChange(pill)}
                            className={`px-4 md:px-10 py-2.5 md:py-3.5 rounded-xl md:rounded-[1.2rem] text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all duration-300 min-w-max ${
                                activeTopTab === pill
                                    ? 'bg-[#1a1c23] text-white shadow-xl shadow-gray-200/50 scale-[1.02]'
                                    : 'text-gray-400 hover:text-[#1a1c23] hover:bg-gray-50'
                            }`}
                            suppressHydrationWarning
                        >
                            {pill}
                        </button>
                    ))}
                </div>

                {/* Right Section: Utility & Profile (Desktop) */}
                <div className="hidden md:flex items-center gap-4">
                    {/* Icon Group */}
                    <div className="hidden md:flex items-center gap-1.5 bg-white/50 p-1.5 rounded-2xl border border-white/50 backdrop-blur-sm">
                        <button className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-xl transition-all">
                            <Search className="w-5 h-5" />
                        </button>
                        <button className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-xl transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>
                        <button className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-xl transition-all">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Profile Section (Desktop only, mobile profile is rendered above) */}
                    <div className="relative hidden md:block">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-3 pl-2 pr-4 py-2 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform text-white font-black">
                                {(session?.user?.name || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-black text-gray-900 leading-none">
                                    {session?.user?.name?.split(' ')[0] || 'Admin'}
                                </p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown menu */}
                        {dropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                                <div className="absolute right-0 z-20 mt-4 w-60 bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 p-2 transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
                                    <button 
                                        onClick={() => {
                                            window.location.href = '/admin/profile';
                                            setDropdownOpen(false);
                                        }}
                                        className="flex items-center w-full px-4 py-3 text-sm font-bold text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors gap-3 group"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-gray-50 group-hover:bg-purple-50 text-gray-400 group-hover:text-purple-600 flex items-center justify-center transition-colors">
                                            <User className="w-4 h-4" />
                                        </div>
                                        Settings
                                    </button>
                                    <button 
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                        className="flex items-center w-full px-4 py-3 text-sm font-bold text-rose-600 rounded-2xl hover:bg-rose-50 transition-colors gap-3 group"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center transition-colors">
                                            <LogOut className="w-4 h-4" />
                                        </div>
                                        Sign out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
