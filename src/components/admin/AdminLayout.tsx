'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import AnaAdminAssistant from './AnaAdminAssistant';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export type TopTab = 'Dashboard' | 'Store' | 'Sales' | 'Marketing';

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    
    // Determine initial tab from pathname for consistent SSR/Hydration
    const getInitialTab = (): TopTab => {
        if (pathname === '/admin') return 'Dashboard';
        if (pathname.includes('/admin/products') || pathname.includes('/admin/hotel-catalogue') || pathname.includes('/admin/orders')) return 'Store';
        if (pathname.includes('/admin/invoicing') || pathname.includes('/admin/funnel') || pathname.includes('/admin/abandoned-carts') || pathname.includes('/admin/promocodes') || pathname.includes('/admin/analytics')) return 'Sales';
        if (pathname.includes('/admin/users') || pathname.includes('/admin/subscribers') || pathname.includes('/admin/inquiries')) return 'Marketing';
        return 'Dashboard';
    };

    const [activeTopTab, setActiveTopTab] = useState<TopTab>(getInitialTab());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setActiveTopTab(getInitialTab());
    }, [pathname]);

    // Also update active tab when pathname changes (if needed, but simple state is fine for now)

    const handleToggleCollapse = () => {
        const newValue = !sidebarCollapsed;
        setSidebarCollapsed(newValue);
    };

    const handleTabChange = (tab: TopTab) => {
        setActiveTopTab(tab);
        if (tab === 'Dashboard') window.location.href = '/admin';
        else if (tab === 'Store') window.location.href = '/admin/products';
        else if (tab === 'Sales') window.location.href = '/admin/invoicing';
        else if (tab === 'Marketing') window.location.href = '/admin/users';
    };

    return (
        <div className="flex min-h-screen bg-[#f4f7fe]" suppressHydrationWarning>
            {/* Sidebar */}
            <div className="flex flex-col sticky top-0 h-screen py-4 pl-4 z-50">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    isCollapsed={true}
                    onToggleCollapse={handleToggleCollapse}
                    activeTopTab={activeTopTab}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 px-4 lg:px-6">
                {/* Header */}
                <AdminHeader 
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
                    activeTopTab={activeTopTab}
                    onTabChange={handleTabChange}
                />

                {/* Page Content */}
                <main className="flex-1 py-4 lg:py-6">
                    <div className="max-w-[1600px] mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
