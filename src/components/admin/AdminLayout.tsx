'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('adminSidebarCollapsed');
                if (saved) {
                    return JSON.parse(saved);
                }
            } catch (error) {
                console.error('Error reading from localStorage:', error);
            }
        }
        return false;
    });

    // Save collapsed state to localStorage
    const handleToggleCollapse = () => {
        const newValue = !sidebarCollapsed;
        setSidebarCollapsed(newValue);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newValue));
            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f8f9fc]">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={handleToggleCollapse}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Header */}
                <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                {/* Page Content */}
                <main className="flex-1 py-8 px-4 sm:px-8 max-w-full overflow-x-hidden">
                    {children}
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
