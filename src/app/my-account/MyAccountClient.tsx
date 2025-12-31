'use client';

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface MyAccountClientProps {
    user: any;
}

export default function MyAccountClient({ user }: MyAccountClientProps) {
    const [activeTab, setActiveTab] = useState('dashboard');

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: 'ph-house-line' },
        { id: 'orders', label: 'Order History', icon: 'ph-package' },
        { id: 'address', label: 'Addresses', icon: 'ph-map-pin' },
        { id: 'setting', label: 'Settings', icon: 'ph-gear-six' },
    ];

    return (
        <div className="my-account-section relative w-full bg-white">
            {/* Breadcrumb */}
            <div className="breadcrumb-block py-6 bg-zinc-50 border-b border-zinc-100">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-zinc-900 font-medium">My Account</span>
                    </div>
                    <div className="heading3 mt-2 font-bold text-2xl">My Account</div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 lg:py-16">
                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

                    {/* Left Sidebar */}
                    <div className="w-full md:w-1/3 lg:w-1/4">
                        <div className="user-card bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg mb-4">
                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <h3 className="text-xl font-bold text-zinc-900">{user?.name}</h3>
                                <p className="text-zinc-500 text-sm mt-1">{user?.email}</p>
                            </div>

                            <div className="mt-8 flex flex-col gap-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-base font-medium transition-all duration-300 w-full text-left
                                            ${activeTab === tab.id
                                                ? 'bg-purple-600 text-white shadow-md'
                                                : 'text-zinc-600 hover:bg-zinc-50 hover:text-purple-600'
                                            }`}
                                    >
                                        <i className={`ph ${tab.icon} text-xl`}></i>
                                        {tab.label}
                                    </button>
                                ))}
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="flex items-center gap-3 px-5 py-3.5 rounded-xl text-base font-medium transition-all duration-300 w-full text-left text-red-500 hover:bg-red-50"
                                >
                                    <i className="ph ph-sign-out text-xl"></i>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="w-full md:w-2/3 lg:w-3/4">

                        {/* Dashboard Tab */}
                        {activeTab === 'dashboard' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="heading flex items-center justify-between">
                                    <h4 className="text-2xl font-bold text-zinc-900">Dashboard</h4>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Total Orders', value: '0', icon: 'ph-shopping-bag', color: 'text-purple-600', bg: 'bg-purple-50' },
                                        { label: 'Pending', value: '0', icon: 'ph-clock', color: 'text-orange-600', bg: 'bg-orange-50' },
                                        { label: 'Completed', value: '0', icon: 'ph-check-circle', color: 'text-green-600', bg: 'bg-green-50' }
                                    ].map((stat, idx) => (
                                        <div key={idx} className="p-6 rounded-2xl border border-zinc-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                                    <i className={`ph-bold ${stat.icon} text-2xl`}></i>
                                                </div>
                                                <span className="text-3xl font-bold text-zinc-900">{stat.value}</span>
                                            </div>
                                            <p className="text-zinc-500 font-medium">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="recent-orders bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 text-center mt-8">
                                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300">
                                        <i className="ph ph-shopping-cart text-3xl"></i>
                                    </div>
                                    <h5 className="text-lg font-bold text-zinc-900">No Recent Orders</h5>
                                    <p className="text-zinc-500 mt-2 mb-6">Looks like you haven't placed any orders yet.</p>
                                    <Link href="/shop" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105">
                                        Start Shopping
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div className="space-y-6 animate-fade-in">
                                <h4 className="text-2xl font-bold text-zinc-900">Order History</h4>
                                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-12 text-center">
                                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="ph ph-receipt text-4xl text-zinc-300"></i>
                                    </div>
                                    <h5 className="text-lg font-bold text-zinc-900">No Orders Found</h5>
                                    <p className="text-zinc-500 mt-2">You haven't placed any orders yet.</p>
                                </div>
                            </div>
                        )}

                        {/* Address Tab */}
                        {activeTab === 'address' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-2xl font-bold text-zinc-900">My Addresses</h4>
                                    <button className="text-purple-600 font-bold hover:underline flex items-center gap-1">
                                        <i className="ph-bold ph-plus"></i> Add New
                                    </button>
                                </div>
                                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-12 text-center border-dashed border-2">
                                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="ph ph-map-pin text-4xl text-zinc-300"></i>
                                    </div>
                                    <h5 className="text-lg font-bold text-zinc-900">No Addresses Saved</h5>
                                    <p className="text-zinc-500 mt-2">Add an address for a faster checkout.</p>
                                </div>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'setting' && (
                            <div className="space-y-6 animate-fade-in">
                                <h4 className="text-2xl font-bold text-zinc-900">Account Settings</h4>
                                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8">
                                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-zinc-900">Full Name</label>
                                                <div className="relative">
                                                    <i className="ph ph-user absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg"></i>
                                                    <input
                                                        type="text"
                                                        defaultValue={user?.name}
                                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition-all"
                                                        placeholder="Your Name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-zinc-900">Email Address</label>
                                                <div className="relative">
                                                    <i className="ph ph-envelope absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg"></i>
                                                    <input
                                                        type="email"
                                                        defaultValue={user?.email}
                                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500 cursor-not-allowed outline-none"
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
