'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    Menu
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    children?: NavItem[];
}

const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    {
        name: 'Finances',
        href: '/admin/finances',
        icon: Wallet,
        children: [
            { name: 'Invoices', href: '/admin/finances/invoices', icon: FileText },
            { name: 'Expenses', href: '/admin/finances/expenses', icon: Receipt },
            { name: 'Quotations', href: '/admin/finances/quotations', icon: ClipboardList },
        ],
    },
    { name: 'Sales Funnel', href: '/admin/funnel', icon: Target },
    { name: 'WhatsApp', href: '/admin/whatsapp', icon: MessageCircle },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
    { name: 'Abandoned Carts', href: '/admin/abandoned-carts', icon: ShoppingCart },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Promo Codes', href: '/admin/promocodes', icon: TicketPercent },
    { name: 'Subscribers', href: '/admin/subscribers', icon: UserCircle },
    { name: 'Inquiries', href: '/admin/inquiries', icon: Mail },
    { name: 'Import Orders', href: '/admin/import', icon: Upload },
];

const NavItemComponent = ({
    item,
    isCollapsed,
    pathname,
    onClose,
    expandedMenus,
    toggleMenu,
}: {
    item: NavItem;
    isCollapsed: boolean;
    pathname: string;
    onClose: () => void;
    expandedMenus: string[];
    toggleMenu: (name: string) => void;
}) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.name);
    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
    const isChildActive = hasChildren && item.children?.some(child => pathname.startsWith(child.href));

    if (hasChildren) {
        return (
            <div className="relative">
                <button
                    onClick={() => toggleMenu(item.name)}
                    title={isCollapsed ? item.name : undefined}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl transition-all duration-200 group ${isActive || isChildActive
                        ? 'bg-purple-600/20 text-purple-400'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <div className={`flex items-center ${!isCollapsed && 'gap-3'}`}>
                        <Icon className={`w-5 h-5 ${isActive || isChildActive ? 'text-purple-400' : 'text-gray-400 group-hover:text-white'}`} />
                        {!isCollapsed && <span className="font-medium">{item.name}</span>}
                    </div>
                    {!isCollapsed && (
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    )}
                </button>

                {/* Collapsed state - show popover on click */}
                {isCollapsed && isExpanded && (
                    <div
                        className="fixed ml-2 z-[100] animate-in fade-in slide-in-from-left-2 duration-200"
                        style={{
                            left: '80px',
                            top: 'auto',
                        }}
                    >
                        <div className="bg-[#1a1c23] border border-gray-700 rounded-xl shadow-2xl py-2 min-w-[180px]">
                            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-700 mb-1">
                                {item.name}
                            </div>
                            {item.children?.map((child) => {
                                const ChildIcon = child.icon;
                                const isChildItemActive = pathname === child.href || pathname.startsWith(child.href);
                                return (
                                    <Link
                                        key={child.name}
                                        href={child.href}
                                        onClick={() => {
                                            toggleMenu(item.name); // Close the popover after clicking
                                            if (window.innerWidth < 1024) onClose();
                                        }}
                                        className={`flex items-center gap-3 px-4 py-2.5 transition-all duration-200 ${isChildItemActive
                                            ? 'bg-purple-600 text-white'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        <ChildIcon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{child.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Expanded state - show children inline */}
                {!isCollapsed && isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                        {item.children?.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildItemActive = pathname === child.href || pathname.startsWith(child.href);
                            return (
                                <Link
                                    key={child.name}
                                    href={child.href}
                                    onClick={() => window.innerWidth < 1024 && onClose()}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isChildItemActive
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}
                                >
                                    <ChildIcon className="w-4 h-4" />
                                    <span className="text-sm">{child.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href={item.href}
            onClick={() => window.innerWidth < 1024 && onClose()}
            title={isCollapsed ? item.name : undefined}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-gray-400 hover:text-white'
                }`}
        >
            <div className={`flex items-center ${!isCollapsed && 'gap-3'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
            </div>
            {!isCollapsed && isActive && <ChevronRight className="w-4 h-4 opacity-75" />}
        </Link>
    );
};

const SidebarContent = ({
    isCollapsed,
    onClose,
    onToggleCollapse,
    pathname,
    expandedMenus,
    toggleMenu,
}: {
    isCollapsed: boolean;
    onClose: () => void;
    onToggleCollapse: () => void;
    pathname: string;
    expandedMenus: string[];
    toggleMenu: (name: string) => void;
}) => (
    <div className="flex flex-col h-full bg-[#1a1c23] text-white">
        {/* Header */}
        <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} border-b border-gray-800`}>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0 group">
                    <Shield className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </div>
                {!isCollapsed && <span className="text-lg font-bold tracking-wide">Anose Admin</span>}
            </div>
            {/* Mobile Toggle (Hamburger) - Replaces the X */}
            <button
                type="button"
                onClick={onClose}
                className="lg:hidden ml-auto p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Close menu"
            >
                <Menu className="w-6 h-6" />
            </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 overflow-y-auto custom-scrollbar">
            <nav className={`space-y-1 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                {navigation.map((item) => (
                    <NavItemComponent
                        key={item.name}
                        item={item}
                        isCollapsed={isCollapsed}
                        pathname={pathname}
                        onClose={onClose}
                        expandedMenus={expandedMenus}
                        toggleMenu={toggleMenu}
                    />
                ))}
            </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-800 space-y-2">
            {/* Mobile Close Button */}
            <button
                type="button"
                onClick={onClose}
                className="lg:hidden flex items-center justify-center gap-2 w-full p-3 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors group"
            >
                <ChevronsLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                <span className="font-medium">Close Menu</span>
            </button>

            {/* Desktop Collapse Button */}
            <button
                type="button"
                onClick={onToggleCollapse}
                className={`hidden lg:flex items-center justify-center w-full p-2 text-gray-500 hover:text-white rounded-lg transition-colors`}
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                {isCollapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
            </button>
        </div>
    </div>
);

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname();
    const [expandedMenus, setExpandedMenus] = useState<string[]>([]); // Start with all menus closed

    const toggleMenu = (name: string) => {
        setExpandedMenus(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    return (
        <>
            {/* Mobile Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <SidebarContent
                    isCollapsed={false}
                    onClose={onClose}
                    onToggleCollapse={onToggleCollapse}
                    pathname={pathname}
                    expandedMenus={expandedMenus}
                    toggleMenu={toggleMenu}
                />
            </div>

            {/* Desktop Sidebar */}
            <div className={`hidden lg:flex lg:flex-col sticky top-0 h-screen z-30 transition-all duration-300 border-r border-gray-800 flex-shrink-0 ${isCollapsed ? 'lg:w-20' : 'lg:w-72'
                }`}>
                <SidebarContent
                    isCollapsed={isCollapsed}
                    onClose={onClose}
                    onToggleCollapse={onToggleCollapse}
                    pathname={pathname}
                    expandedMenus={expandedMenus}
                    toggleMenu={toggleMenu}
                />
            </div>
        </>
    );
}
