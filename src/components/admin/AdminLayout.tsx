'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import { SessionProvider } from 'next-auth/react';

interface AdminLayoutProps {
    children: React.ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Load collapsed state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('adminSidebarCollapsed');
        if (saved) {
            setSidebarCollapsed(JSON.parse(saved));
        }
    }, []);

    // Save collapsed state to localStorage
    const handleToggleCollapse = () => {
        const newValue = !sidebarCollapsed;
        setSidebarCollapsed(newValue);
        localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newValue));
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc]">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={handleToggleCollapse}
            />

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
                {/* Header */}
                <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                {/* Page Content */}
                <main className="py-8 px-4 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <SessionProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </SessionProvider>
    );
}
