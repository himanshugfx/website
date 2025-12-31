'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    X,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    TicketPercent
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Abandoned Carts', href: '/admin/abandoned-carts', icon: ShoppingCart },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Promo Codes', href: '/admin/promocodes', icon: TicketPercent },
];

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname();

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#1a1c23] text-white">
            {/* Header */}
            <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} border-b border-gray-800`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
                        <span className="text-white font-bold text-xl">A</span>
                    </div>
                    {!isCollapsed && <span className="text-lg font-bold tracking-wide">Anose Admin</span>}
                </div>
                {/* Mobile close button */}
                <button
                    onClick={onClose}
                    className="lg:hidden ml-auto text-gray-400 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 overflow-y-auto custom-scrollbar">
                <nav className={`space-y-1 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => window.innerWidth < 1024 && onClose()}
                                title={isCollapsed ? item.name : undefined}
                                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <div className={`flex items-center ${!isCollapsed && 'gap-3'}`}>
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                    {!isCollapsed && <span className="font-medium">{item.name}</span>}
                                </div>
                                {!isCollapsed && isActive && <ChevronRight className="w-4 h-4 opacity-75" />}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-gray-800">
                {!isCollapsed ? (
                    <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 rounded-xl p-4 border border-purple-500/20">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <span className="text-purple-300 text-xs font-bold">AB</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Anose Beauty</p>
                                <p className="text-xs text-purple-300">Admin Panel</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <span className="text-purple-300 text-xs font-bold">AB</span>
                        </div>
                    </div>
                )}

                {/* Collapse Button (Desktop Only) */}
                <button
                    onClick={onToggleCollapse}
                    className={`hidden lg:flex items-center ${isCollapsed ? 'justify-center' : 'justify-center'} w-full mt-4 p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors`}
                >
                    {isCollapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <SidebarContent />
            </div>

            {/* Desktop Sidebar */}
            <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${isCollapsed ? 'lg:w-20' : 'lg:w-72'
                }`}>
                <SidebarContent />
            </div>
        </>
    );
}
