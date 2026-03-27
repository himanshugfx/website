'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Search, Users as UsersIcon, Shield, ChevronRight, RefreshCw } from 'lucide-react';

interface User {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    createdAt: string;
    _count: {
        orders: number;
    };
}

const ROLE_OPTIONS = ['customer', 'admin'];

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [search]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/users?search=${search}`);
            const data = await res.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        if (!confirm('Are you sure you want to change this user\'s role?')) return;

        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: userId, role: newRole }),
            });

            if (res.ok) {
                fetchUsers();
            } else {
                alert('Failed to update user role');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user role');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center text-center gap-6 mb-12">
                    <div>
                        <div className="flex flex-col items-center gap-3">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter font-primary">User Accounts</h1>
                            <div className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-200 shadow-sm inline-block">
                                {users.length} Active Records
                            </div>
                        </div>
                        <p className="text-sm md:text-base text-gray-500 font-medium mt-3 uppercase tracking-wider max-w-2xl">
                            Managing <span className="text-purple-600 font-black italic underline decoration-purple-200 underline-offset-4">access control</span> and account level permissions
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                        <div className="relative group w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name, email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-600 transition-all shadow-sm"
                            />
                        </div>
                        <button 
                            onClick={fetchUsers} 
                            className="p-4 bg-white border border-gray-100 hover:bg-gray-50 rounded-2xl transition-all shadow-sm group"
                        >
                            <RefreshCw className={`w-5 h-5 text-gray-900 group-hover:text-purple-600 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Orders
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                        Joined
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-gray-500">Loading users...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <UsersIcon className="w-8 h-8 text-purple-500" />
                                                </div>
                                                <p className="text-gray-500 font-medium">No users found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white font-semibold">
                                                            {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={`/admin/users/${user.id}`}
                                                            className="text-sm font-semibold text-gray-900 hover:text-purple-600 transition-colors line-clamp-1"
                                                        >
                                                            {user.name || 'No name'}
                                                        </Link>
                                                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-0 focus:ring-2 focus:ring-purple-500 cursor-pointer ${user.role === 'admin'
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-black text-white'
                                                        }`}
                                                >
                                                    {ROLE_OPTIONS.map((role) => (
                                                        <option key={role} value={role}>
                                                            {role === 'admin' ? '👑 Admin' : '👤 Customer'}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900">
                                                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                                    {user._count.orders} orders
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                                                {new Date(user.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <Link
                                                    href={`/admin/users/${user.id}`}
                                                    className="inline-flex items-center justify-center p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
