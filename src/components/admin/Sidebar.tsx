'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import AnaAdminAssistant from './AnaAdminAssistant';

import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    ChevronRight,
    ChevronDown,
    ChevronsLeft,
    ChevronsRight,
    TicketPercent,
    Mail,
    Upload,
    FileText,
    Target,
    MessageCircle,
    BarChart,
    Receipt,
    Wallet,
    ClipboardList,
    Shield,
    UserCircle,
    Menu,
    X,
    Building2
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    activeTopTab: 'Dashboard' | 'Store' | 'Sales' | 'Marketing';
}

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    children?: NavItem[];
}

const navigationGroups = [
    {
        title: 'Main',
        items: [
            { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        ]
    },
    {
        title: 'Store Management',
        items: [
            { name: 'Products', href: '/admin/products', icon: Package },
            { name: 'Hotel Catalogue', href: '/admin/hotel-catalogue', icon: Building2 },
            { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
            {
                name: 'Invoicing',
                href: '/admin/invoicing',
                icon: Wallet,
                children: [
                    { name: 'Invoices', href: '/admin/invoicing/invoices', icon: FileText },
                    { name: 'Expenses', href: '/admin/invoicing/expenses', icon: Receipt },
                    { name: 'Quotations', href: '/admin/invoicing/quotations', icon: ClipboardList },
                ],
            },
        ]
    },
    {
        title: 'Marketing & Growth',
        items: [
            { name: 'Sales Funnel', href: '/admin/funnel', icon: Target },
            { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
            { name: 'Abandoned Carts', href: '/admin/abandoned-carts', icon: ShoppingCart },
            { name: 'Promo Codes', href: '/admin/promocodes', icon: TicketPercent },
        ]
    },
    {
        title: 'Customers & CRM',
        items: [
            { name: 'Users', href: '/admin/users', icon: Users },
            { name: 'Subscribers', href: '/admin/subscribers', icon: UserCircle },
            { name: 'Inquiries', href: '/admin/inquiries', icon: Mail },
        ]
    }
];

const NavItemComponent = ({
    item,
    isCollapsed,
    pathname,
    onClose,
}: {
    item: NavItem;
    isCollapsed: boolean;
    pathname: string;
    onClose: () => void;
}) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

    return (
        <Link
            href={item.href}
            onClick={() => window.innerWidth < 1024 && onClose()}
            title={isCollapsed ? item.name : undefined}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 group relative ${isActive
                ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/30 ring-4 ring-purple-600/10'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
            }`}
        >
            <Icon className={`w-5 h-5 transition-transform group-hover:scale-110`} />
            
            {/* Text label on hover for desktop (tooltip-like) */}
            <span className="absolute left-16 px-4 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all z-50 whitespace-nowrap border border-white/10 shadow-xl">
                {item.name}
            </span>
        </Link>
    );
};

const SidebarContent = ({
    onClose,
    pathname,
    activeTopTab,
}: {
    onClose: () => void;
    pathname: string;
    activeTopTab: 'Dashboard' | 'Store' | 'Sales' | 'Marketing';
}) => {
    // Flatten and filter based on top tab
    const filteredItems = navigationGroups.flatMap(group => {
        if (activeTopTab === 'Dashboard') {
            return [];
        }
        if (activeTopTab === 'Store') {
            return group.items.filter(item => 
                ['Products', 'Hotel Catalogue', 'Orders'].includes(item.name)
            );
        }
        if (activeTopTab === 'Sales') {
            return group.items.filter(item => 
                ['Invoicing', 'Sales Funnel', 'Analytics', 'Abandoned Carts', 'Promo Codes'].includes(item.name)
            );
        }
        if (activeTopTab === 'Marketing') {
            return group.items.filter(item => 
                ['Users', 'Subscribers', 'Inquiries'].includes(item.name)
            );
        }
        return [];
    });

    return (
        <div className="flex flex-col h-full bg-white border border-gray-100/50 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden py-8">
            {/* Top Branding & AI Assistant Trigger */}
            <div className="flex justify-center mb-10 px-2 text-center">
                <AnaAdminAssistant inline={true} />
            </div>

            {/* Main Navigation - Icons Only (Centered) */}
            <div className="flex-1 px-4 overflow-y-auto no-scrollbar flex flex-col items-center justify-center gap-4">
                {activeTopTab === 'Dashboard' ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-4">
                        <div className="flex flex-col items-center gap-1.5 pointer-events-none select-none">
                            {"DASHBOARD".split("").map((char, index) => (
                                <span key={index} className="text-[12px] font-black text-purple-200 uppercase leading-none tracking-widest">
                                    {char}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    filteredItems.map((item) => (
                        <NavItemComponent
                            key={item.name}
                            item={item}
                            isCollapsed={true}
                            pathname={pathname}
                            onClose={onClose}
                        />
                    ))
                )}
            </div>

            {/* Bottom Section */}
            <div className="px-4 flex flex-col items-center">
                <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    title="Logout"
                    className="w-12 h-12 flex items-center justify-center text-rose-500 hover:text-white hover:bg-rose-500 rounded-2xl transition-all duration-300 group shadow-lg shadow-rose-100 hover:shadow-rose-500/30"
                    suppressHydrationWarning
                >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse, activeTopTab }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Sidebar Toggle Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60] lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Viewport */}
            <div className={`fixed inset-y-0 left-0 z-[70] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:sticky lg:top-0 lg:h-screen lg:flex lg:flex-col ${
                isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            } ${isCollapsed ? 'w-24' : 'w-72 lg:w-24'}`}>
                <div className="h-full p-4">
                    <SidebarContent
                        onClose={onClose}
                        pathname={pathname}
                        activeTopTab={activeTopTab}
                    />
                </div>
            </div>
        </>
    );
}
